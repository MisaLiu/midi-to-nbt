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

  let soundPos = [ '~', '~', '~' ];
  if (global.piano && global.piano.facing) {
    let offset = ((43.5 - (pitch - 21)) / 87).toFixed(1);

    if (
      global.piano.facing === 'north' ||
      global.piano.facing === 'south'
    ) soundPos[0] += offset;
    if (
      global.piano.facing === 'east' ||
      global.piano.facing === 'west'
    ) soundPos[2] += offset;
  }

  server.runCommandSilent(
    `execute as @a at @s run playsound minecraft:lkrb.piano.p${pitch}${velocityCode} master @s ${soundPos.join(' ')} 1 1`
  );
};

ServerEvents.loaded((e) => {
  const server = e.getServer();
  const persistentData = server.getPersistentData();

  if (
    persistentData.contains('piano_start_pos') &&
    persistentData.contains('piano_height') &&
    persistentData.contains('piano_facing') &&
    persistentData.contains('piano_dimension')
  ) {
    let pianoStartPos = persistentData.get('piano_start_pos');
    let pianoHeight = persistentData.getInt('piano_height');
    let pianoFacing = persistentData.getString('piano_facing');
    let pianoDimension = persistentData.getString('piano_dimension');

    global.piano = {
      startPos: pianoStartPos,
      height: pianoHeight,
      facing: pianoFacing,
      dimension: pianoDimension,
    };
  } else {
    global.piano = null;
  }

  return 0;
});
