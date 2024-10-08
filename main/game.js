import chalk from 'chalk';
import readlineSync from 'readline-sync';

class Player {
  constructor(hp, dmg, rech, actch, ptch) {
    this.hp = hp;
    this.dmg = dmg;
    this.rech = 33;
    this.actch = 67;
    this.ptch = 50;
    this.deal = Math.round((Math.random() * (Math.round((this.dmg * 1.7)) - this.dmg) + this.dmg));
  }

  reward() {
    let random = Math.round(Math.random() * 100);

    if (random >= 75) {
      console.log(chalk.cyanBright('능력치 상승!'))
      this.hp += random;
      this.dmg += Math.round(Math.random() * this.dmg);
      this.rech += Math.round(Math.random() * 3);
      this.actch += Math.round(Math.random() * 6);
      this.ptch += Math.round(Math.random() * 5);
    }
  }



  attack(target) {    // 플레이어의 공격
    this.deal = Math.round((Math.random() * (Math.round((this.dmg * 1.7)) - this.dmg) + this.dmg));
    target.hp -= this.deal;
  }

  chain(target) {  //연속공격
    this.deal = Math.round((Math.random() * (Math.round((this.dmg * 1.7)) - this.dmg) + this.dmg));
    while (this.count <= 10) {
      if (this.rech >= Math.random() * 100) {
        this.count++;
      } else
        break;
    }

    this.temp = this.count * this.deal;
    target.hp -= this.temp;
  }

  drain(target) { //흡혈
    this.deal = Math.round((Math.random() * (Math.round((this.dmg * 1.7)) - this.dmg) + this.dmg));
    this.heal = Math.round(this.deal * 0.6);

    target.hp -= this.deal;
    this.hp += this.heal;
  }

  react(target) { //반격
    this.deal = Math.round((Math.random() * (Math.round((this.dmg * 1.7)) - this.dmg) + this.dmg));
    this.temp = 0;
    if (this.actch >= Math.random() * 100) {
      this.temp = this.deal * 2;
      target.hp -= this.temp;
    }
  }

  passthrough(target) {  //돌파
    if (this.ptch >= Math.random() * 100) {
      target.hp = 0;
    }
  }
}

class Monster {
  constructor(hp, dmg, deal) {
    this.hp = hp;
    this.dmg = dmg;
    this.deal = Math.round((Math.random() * (Math.round(this.dmg * 1.3) - this.dmg) + this.dmg));
  }

  attack(target) {    // 몬스터의 공격
    target.hp -= this.deal;
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
        `\n1.공격 2.연속공격(${player.rech}%) 3.흡혈공격(DMG의 60%) 4.반격(${player.actch}%) 5.돌파(${player.ptch}%)`
      )
    );
    const choice = readlineSync.question('선택: ');

    // 플레이어의 선택에 따라 다음 행동 처리
    logs.push(chalk.green(`${choice}를 선택하셨습니다.`));

    switch (choice) {
      case '1':
        player.attack(monster);
        logs.push(chalk.blue(`플레이어의 공격! ${player.deal}의 데미지!`));
        monster.attack(player);
        logs.push(chalk.red(`몬스터의 공격! ${monster.deal}의 데미지!`));
        break;
      case '2':
        player.temp = 0;
        player.count = 0;
        player.chain(monster);
        logs.push(chalk.blue(`플레이어의 ${player.count}회 연속공격! 총 ${player.temp}의 데미지!`));
        monster.attack(player);
        logs.push(chalk.red(`몬스터의 공격! ${monster.deal}의 데미지!`));
        break;
      case '3':
        player.drain(monster);
        logs.push(chalk.blue(`플레이어의 흡혈 공격! ${player.deal}의 데미지! ${player.heal} 회복`));
        monster.attack(player);
        logs.push(chalk.red(`몬스터의 공격! ${monster.deal}의 데미지!`));
        break;
      case '4':
        player.react(monster);
        if (player.temp === 0) {
          monster.attack(player);
          logs.push(chalk.red(`몬스터의 공격! ${monster.deal}의 데미지!`));
        } else
          logs.push(chalk.blue(`플레이어의 반격! ${player.temp}의 데미지!`));
        break;
      case '5':
        monster.attack(player);
        logs.push(chalk.red(`몬스터의 공격! ${monster.deal}의 데미지!`));
        if (player.hp > 0)
          player.passthrough(monster);
        break;
    }
  }
};


export async function startGame() {
  console.clear();
  const player = new Player(100, 7);
  let stage = 1;

  while (stage <= 10) {
    const monster = new Monster(stage * 100 + Math.round(Math.random() * stage) * 25, stage * 5 + Math.round(Math.random() * stage));
    await battle(stage, player, monster);

    // 스테이지 클리어 및 게임 종료 조건
    if (monster.hp <= 0) {
      console.log(chalk.cyan('전투가 종료되었습니다'))
      player.reward();
      player.hp += 50;
      readlineSync.question('입력하여 계속...')
      stage++;
    } else if (player.hp <= 0) {
      console.log(chalk.red('죽었습니다'))
      console.log(chalk.redBright('GAME OVER'));
      readlineSync.question(chalk.yellow('끝내기'))
      break;
    }
  }
  if (stage > 10)
    console.log(chalk.yellowBright('승리!'))
}