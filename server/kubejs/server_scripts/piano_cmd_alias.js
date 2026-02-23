// priority: 0

// You can change the blocks for each channel by modify this array
const ChannelBlocks = [
  "minecraft:white_concrete",
  "minecraft:light_gray_concrete",
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

        const block = level.createEntity("minecraft:block_display");
        if (block) {
          block.setPosition(pos.x(), pos.y(), pos.z());
          block.mergeNbt({
            Tags: [ 'piano_note' ],
            block_state: { Name: getChannelBlock(channel) },
            brightness: { block: 15, sky: 15 },
          });
          block.persistentData.putInt('pitch', pitch);
          block.persistentData.putInt('velocity', velocity);
          block.spawn();

          return 1;
        }

        return 0;
      })
    ))))
  );
});
