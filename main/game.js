import chalk from 'chalk';
import readlineSync from 'readline-sync';

class Player {
  constructor(hp, dmg, rech, actch, fbch) {
    this.hp = hp;
    this.dmg = dmg;
    this.rech = 67;
    this.actch = 33;
    this.fbch = 50;
  }

  reward() {
    let random = Math.round(Math.random() * 3) + 1;
    let chance = Math.round(Math.random() * 100);

    if (random > 50) {
      this.hp += random;
    }
    switch (chance) {
      case '1':
        this.dmg += this.dmg / 2;

      case '2':
        this.rech += (100 - this.rech) / 10;

      case '3':
        this.actch += (100 - this.actch) / 20;

      case '4':
        this.fbch += (100 - this.fbch) / 50;
    }
  }

  attack(target) {    // 플레이어의 공격
    let dealt;
    dealt = Math.round((Math.random() * (Math.round((this.dmg * 1.7)) - this.dmg) + this.dmg));
    target.hp -= dealt;
  }

  chain(target) {  //연속공격
    let dealt;
    if (this.rech > Math.random() * 100) {
      dealt = Math.round((Math.random() * (Math.round((this.dmg * 1.7)) - this.dmg) + this.dmg));
      target.hp -= dealt;
      this.chain(target)
    } else {
      console.log('실패')
    }
  }
  drain(target){
    let dealt;
    dealt = Math.round((Math.random() * (Math.round((this.dmg * 1.7)) - this.dmg) + this.dmg) * 0.6);
    target.hp -= dealt;
    this.hp += dealt;
  }

  react(target){
    let dealt, heal;
    if (this.actch > Math.random() * 100) {
      heal = Math.round((Math.random() * (Math.round(target.dmg * 1.3) - target.dmg) + target.dmg));
      this.hp += heal;
      dealt = Math.round((Math.random() * (Math.round((this.dmg * 1.7)) - this.dmg) + this.dmg) * 1.2);
      target.hp -= dealt;
    }
  }
}

class Monster {
  constructor(hp, dmg) {
    this.hp = hp;
    this.dmg = dmg;
  }

  attack(target) {    // 몬스터의 공격
    let dealt;
    dealt = Math.round((Math.random() * (Math.round(this.dmg * 1.3) - this.dmg) + this.dmg));
    target.hp -= dealt;
    //logs.push(chalk.red(`${dealt}의 피해`));
  }
}

function displayStatus(stage, player, monster) {
  console.log(chalk.magentaBright(`\n=== Current Status ===`));
  console.log(
    chalk.cyanBright(`| Stage: ${stage} `) +
    chalk.blueBright(
      `| Player HP: ${player.hp}, DMG: ${player.dmg} ~ ${Math.round(player.dmg * 1.7)} `,
    ) +
    chalk.redBright(
      `| Monster HP: ${monster.hp}, DMG: ${monster.dmg} ~ ${Math.round(monster.dmg * 1.3)} |`,
    ),
  );
  console.log(chalk.magentaBright(`=====================\n`));
}

const battle = async (stage, player, monster) => {
  let logs = [];

  while (player.hp > 0 && monster.hp > 0) {
    console.clear();
    displayStatus(stage, player, monster);

    console.log(chalk.gray(`${stage}층 몬스터를 마주했습니다.`))

    logs.forEach((log) => console.log(log));

    console.log(
      chalk.green(
        `\n1. 공격 2. 연속공격(${player.rech}%) 3. 흡혈공격(DMG의 60%) 4. 반격(${player.actch}%) 5. 도주(${player.fbch}%)`,
      ) + chalk.redBright(`\n4, 5는 몬스터가 먼저 행동합니다!`),
    );
    const choice = readlineSync.question('선택: ');

    // 플레이어의 선택에 따라 다음 행동 처리
    logs.push(chalk.green(`${choice}를 선택하셨습니다.`));

    switch (choice) {
      case '1':
        player.attack(monster);
        logs.push(chalk.blue(`플레이어의 공격! ${player.attack(monster)}의 데미지`))
        monster.attack(player);
        logs.push(chalk.red(`몬스터의 공격! ${monster.attack(player)}의 데미지`))
        break;
      case '2':
        player.chain(monster);
        monster.attack(player);
        break;
      case '3':
        player.drain(monster);
        monster.attack(player);
        break;
      case '4':
        monster.attack(player);
        player.react(monster);
        break;
      case '5':
        fallback();
        break;
    }
  }

};

export async function startGame() {
  console.clear();
  const player = new Player(100, 7, 20, 60, 50);
  let stage = 1;

  while (stage <= 10) {
    const monster = new Monster(stage * 100, stage * 5);
    await battle(stage, player, monster);

    // 스테이지 클리어 및 게임 종료 조건
    if (monster.hp <= 0) {
      console.log(chalk.cyan('몬스터를 돌파했습니다'))
      stage++;
      player.hp += 50;
      player.reward();
      readlineSync.question('입력하여 계속...')
    } else if (player.hp <= 0) {
      console.log(chalk.red('죽었습니다'))
      console.log(chalk.redBright('GAME OVER'));
      break;
    }
  }
  if (stage > 10)
    console.log(chalk.yellowBright('승리!'))

}