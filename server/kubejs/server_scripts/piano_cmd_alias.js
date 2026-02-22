// priority: 0

// You can change the blocks for each channel by modify this array
const ChannelBlocks = [
  "minecraft:ochre_froglight",
  "minecraft:verdant_froglight",
  "minecraft:pearlescent_froglight",
  "minecraft:sea_lantern",
  "minecraft:glowstone",
  "minecraft:shroomlight"
];

function armorNBTBuilder(pitch, velocity, channel) {
  const _channel = (channel - 1) % ChannelBlocks.length;

  // Edit armor stands' NBT data here
  return (
    [
      '{',
      'Tags:["piano_note"],',
      'OnGround:0b,',
      `Pose:{LeftArm:[${pitch}f,${velocity}f,0f]},`,
      `ArmorItems:[{},{},{},{id:"${ChannelBlocks[_channel]}",Count:1b}],`,
      'Marker:1b,',
      'Invisible:1b',
      '}'
    ].join('')
  )
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

        ctx.source.server.runCommandSilent(`summon minecraft:armor_stand ${pos.x()} ${pos.y()} ${pos.z()} ${armorNBTBuilder(pitch, velocity, channel)}`);
        return 1;
      })
    ))))
  );
});
