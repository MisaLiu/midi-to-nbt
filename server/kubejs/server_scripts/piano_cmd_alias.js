// priority: 0

// You can change the blocks for each channel by modify this array
const ChannelBlocks = [
  "minecraft:brown_concrete",
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
  "minecraft:pink_concrete"
];

function getChannelBlock(channel) {
  const index = channel % ChannelBlocks.length;
  return ChannelBlocks[index];
}

ServerEvents.commandRegistry(event => {
  const { commands: Commands, arguments: Arguments } = event
  
  // Used for generating armor stands
  // Usage: /note [position] [pitch] [velocity] [channel]
  event.register(
    Commands.literal('note')
      .then(Commands.argument('position', Arguments.VEC3_CENTERED.create(event))
      .then(Commands.argument('pitch', Arguments.INTEGER.create(event))
      .then(Commands.argument('velocity', Arguments.INTEGER.create(event))
      .then(Commands.argument('channel', Arguments.INTEGER.create(event))
      .executes((ctx) => {
        const pos = Arguments.VEC3_CENTERED.getResult(ctx, 'position');
        const pitch = Arguments.INTEGER.getResult(ctx, 'pitch');
        const velocity = Arguments.INTEGER.getResult(ctx, 'velocity');
        const channel = Arguments.INTEGER.getResult(ctx, 'channel');

        const level = ctx.getSource().getLevel();
        if (level.isClientSide()) return 0;

        const note = level.createEntity('minecraft:armor_stand');
        if (note) {
          note.setPosition(pos.x(), pos.y(), pos.z());
          note.mergeNbt({
            Tags: [ 'piano_note' ],
            Marker: 1,
            Invisible: 1,
            OnGround: 0,
            ArmorItems: [ {}, {}, {}, { id: getChannelBlock(channel), Count: 1 } ],
          });

          // Store note pitch and velocity data
          note.persistentData.putInt('pitch', pitch);
          note.persistentData.putInt('velocity', velocity);
          note.spawn();

          return 1;
        }

        return 0;
      })
    ))))
  );
});
