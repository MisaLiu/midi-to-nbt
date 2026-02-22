// priority: 0

// Modify notes' rolling speed here
// if you used a custom tickrate
const ROLLING_SPEED = 5;

// Modify piano's Y position
const PIANO_Y = -61;

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

function getArmorStandData(nbt) {
  const pose = nbt.getCompound('Pose');
  if (!pose) return null;

  const leftArm = pose.get('LeftArm');
  if (!leftArm) return null;

  return {
    pitch: parseInt(leftArm[0]),
    velocity: (parseInt(leftArm[1]) / 100).toFixed(2),
  };
}

function getVelocityCode(velocity) {
  const index = Math.round(velocity * (VelocityMap.length - 1));
  return VelocityMap[index];
}

const RollingDivided = ROLLING_SPEED / 10;

ServerEvents.tick((event) => {
  const server = event.getServer();
  const level = server.getLevel('minecraft:overworld'); //
  const notes = level.getEntities().filterSelector('@e[type=minecraft:armor_stand,tag=piano_note]');

  notes.forEach((armor) => {
    const noteData = getArmorStandData(armor.getNbt());
    if (!noteData) return;

    const y = armor.getY();

    if (y <= PIANO_Y - 1) {
      server.runCommandSilent(`execute as @a at @s run playsound minecraft:lkrb.piano.p${noteData.pitch}${getVelocityCode(noteData.velocity)} master @s ~ ~ ~ 1 1`);
      armor.kill();
    } else {
      armor.setPos(armor.getX(), y - RollingDivided, armor.getZ());
    }
  });
});
