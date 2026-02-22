// priority: 0

// Modify notes' rolling speed here
// if you used a custom tickrate
const ROLLING_SPEED = 5

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

const RollingDivided = ROLLING_SPEED / 10;

ServerEvents.tick((event) => {
  const server = event.getServer();
  const level = server.getLevel('minecraft:overworld'); //
  const notes = level.getEntities().filterSelector('@e[type=minecraft:armor_stand,tag=piano_note]');

  notes.forEach((armor) => {
    const noteData = getArmorStandData(armor.getNbt());
    if (!noteData) return;

    const y = armor.getY();

    if (y <= -59) {
      server.runCommandSilent(`execute as @a at @s run playsound minecraft:lkrb.piano.p${noteData.pitch}fff master @s ~ ~ ~ ${noteData.velocity} 1`);
      armor.kill();
    }

    armor.setPos(armor.getX(), y - RollingDivided, armor.getZ());
  });
});
