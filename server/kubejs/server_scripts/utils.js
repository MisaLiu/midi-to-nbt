// priority: 100

const VelocityMap = [
  'ppp',
  'pp',
  'p',
  'mp',
  'mf',
  'f',
  'ff',
  'fff'
];

global.playNote = function (server, pitch, velocity) {
  const _velocity = (parseInt(velocity || 127) / 127).toFixed(2);
  const velocityCodeIndex = Math.round(_velocity * (VelocityMap.length - 1));
  const velocityCode = VelocityMap[velocityCodeIndex];

  server.runCommandSilent(
    `execute as @a at @s run playsound minecraft:lkrb.piano.p${pitch}${velocityCode} master @s ~ ~ ~ 1 1`
  );
};
