// priority: 0

// You can change the blocks for each channel by modify this array
const ChannelBlocks = [
  "minecraft:red_concrete",
  "minecraft:orange_concrete",
  "minecraft:yellow_concrete",
  "minecraft:lime_concrete",
  "minecraft:green_concrete",
  "minecraft:cyan_concrete",
  "minecraft:light_blue_concrete",
  "minecraft:blue_concrete",
  "minecraft:purple_concrete",
  "minecraft:magenta_concrete",
  "minecraft:pink_concrete",
  "minecraft:brown_concrete"
];

function getChannelBlock(channel) {
  const index = channel % ChannelBlocks.length;
  return ChannelBlocks[index];
}

ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event

  event.register(
    Commands.literal('setpiano')
      .then(Commands.argument('startposition', Arguments.BLOCK_POS.create(event))
      .then(Commands.argument('height', Arguments.INTEGER.create(event))
      .executes(ctx => {
        const source = ctx.getSource();
        const server = source.getServer();
        const player = source.getPlayer();

        const startPos = Arguments.BLOCK_POS.getResult(ctx, 'startposition');
        const height = Arguments.INTEGER.getResult(ctx, 'height');
        const direction = player.getFacing().getName();

        if (
          direction === 'up' ||
          direction === 'down'
        ) {
          server.tell('Cannot facing up/down!');
          return;
        }

        if (height <= 0) {
          server.tell('Cannot set zero/negative height');
          return;
        }

        let pianoPosArr = [ startPos.getX(), startPos.getY(), startPos.getZ() ];

        server.getPersistentData().putIntArray('piano_start_pos', pianoPosArr);
        server.getPersistentData().putInt('piano_height', height);
        server.getPersistentData().putString('piano_facing', direction);

        global.piano = {
          startPos: pianoPosArr,
          height: height,
          facing: direction,
        };

        server.tell(`Success. Piano start position: [ ${pianoPosArr[0]}, ${pianoPosArr[1]}, ${pianoPosArr[2]} ], height: ${height}, facing: ${direction}`);

        return 0;
      })
    ))
  );

  // Used for generating armor stands
  // Usage: /note [pitch] [velocity] [channel]
  event.register(
    Commands.literal('note')
      .then(Commands.argument('pitch', Arguments.INTEGER.create(event))
      .then(Commands.argument('velocity', Arguments.INTEGER.create(event))
      .then(Commands.argument('channel', Arguments.INTEGER.create(event))
      .executes((ctx) => {
        const pitch = Arguments.INTEGER.getResult(ctx, 'pitch');
        const velocity = Arguments.INTEGER.getResult(ctx, 'velocity');
        const channel = Arguments.INTEGER.getResult(ctx, 'channel');

        const level = ctx.getSource().getLevel();
        if (level.isClientSide()) return;

        const server = ctx.getSource().getServer();

        if (global.piano) {
          let notePos = [ global.piano.startPos[0], global.piano.startPos[1] + global.piano.height, global.piano.startPos[2] ];

          if (global.piano.facing === 'north') notePos[0] += (pitch - 21);
          if (global.piano.facing === 'east') notePos[2] += (pitch - 21);
          if (global.piano.facing === 'south') notePos[0] -= (pitch - 21);
          if (global.piano.facing === 'west') notePos[2] -= (pitch - 21);

          let note = level.createEntity('minecraft:armor_stand');
          if (note) {
            note.setPosition(notePos[0] + 0.5, notePos[1], notePos[2] + 0.5);
            note.mergeNbt({
              Tags: [ 'piano_note' ],
              Marker: 1,
              Invisible: 1,
              OnGround: 0,
              Rotation: [ 0, 0 ],
              ArmorItems: [ {}, {}, {}, { id: getChannelBlock(channel), Count: 1 } ],
            });

            // Store note pitch and velocity data
            note.persistentData.putInt('pitch', pitch);
            note.persistentData.putInt('velocity', velocity);
            note.spawn();
          }
        } else {
          global.playNote(server, pitch, velocity);
        }

        return 0;
      })
    )))
  );
});
