import Board from './board'
import { addEvent, getDirection, store } from './utils'
import { moveConfig } from './board'
import moveAudio from '../assets/move.mp3'
import popAudio from '../assets/popup.mp3'

interface Score {
  num: number
  ele: HTMLElement
}

interface Touch {
  x: number
  y: number
}

/**
 * Control
 * 游戏控制类
 * @class Control
 */
export default class Control {
  board: Board
  score: Score
  touch: Touch
  bestScore: Score
  speaker: boolean
  moveState: boolean
  btnBox: HTMLElement
  maskEle: HTMLElement
  ele: HTMLTableElement
  audioMove: HTMLAudioElement
  audioPopup: HTMLAudioElement

  /**
   * Creates an instance of Control.
   * @param {HTMLTableElement} ele 游戏区域board Dom
   * @param {HTMLElement} btnBox 按钮盒子Dom
   * @param {HTMLElement} scoreEle 得分Dom
   * @param {HTMLElement} scoreBestEle 最佳得分Dom
   * @param {HTMLElement} maskEle gameover遮罩 Dom
   * @memberof Control
   */
  constructor(
    ele: HTMLTableElement,
    btnBox: HTMLElement,
    scoreEle: HTMLElement,
    scoreBestEle: HTMLElement,
    maskEle: HTMLElement
  ) {
    this.ele = ele // 游戏区域board Dom
    this.btnBox = btnBox // 按钮盒子Dom
    this.maskEle = maskEle // gameover遮罩 Dom
    this.speaker = true // 扬声器状态 
    this.moveState = false // 移动状态
    this.board = new Board(ele, this.setScore) // board对象
    this.audioMove = new Audio(moveAudio) // 移动声音
    this.audioPopup = new Audio(popAudio) // 生成方块声音
    this.touch = { x: 0, y: 0 } // 触摸事件坐标对象
    this.score = { num: 0, ele: scoreEle } // 得分对象
    this.bestScore = { num: 0, ele: scoreBestEle } // 最佳得分对象
    
    // 初始化游戏
    this.init()
  }

  /**
   * init
   * 初始化游戏
   * @memberof Control
   */
  init() {
    const { map, score, bestScore } = store.fetch('2048')
    
    this.setEventBind() // 事件绑定
    
    bestScore && this.setScore('bestScore', bestScore)

    if (score) { // 根据score判断LocalStorage数据是否存在
      this.board.init(true, map) // 初始化并渲染历史数据
      this.setScore('score', score) // 设置历史得分
    } else {
      this.board.init(true) // 初始化board
    }
  }

  /**
   * reset
   * 重置游戏
   * @memberof Control
   */
  reset() {
    const { board } = this
    board.clearCell() // 清除方块(Cell) 并重置坐标
    board.init(false) // 初始化board
    this.setScore('score') // 初始化得分
    this.maskEle.className = 'mask' // 隐藏遮罩
    store.save('2048', { bestScore: this.bestScore.num }) // 保存最佳得分
  }

  /**
   * setScore
   * 设置得分
   * @memberof Control
   */
  setScore = (scoreName: string, num?: number) => {
    num 
      ? this[scoreName].num += num
      : this[scoreName].num = 0
    
    this.setScoreEle(scoreName)
  }

  /**
   * setScoreEle
   * 设置得分dom
   * @param {any} scoreName 
   * @memberof Control
   */
  setScoreEle(scoreName) {
    this[scoreName].ele.innerHTML = `${this[scoreName].num}`
  }

  /**
   * updateBestScore
   * 更新最佳得分 (根据当前得分判断是否设置)
   * @memberof Control
   */
  updateBestScore() {
    const { score: { num }, bestScore: { num: bestNum } } = this
    const bestScore = num >= bestNum ? num : bestNum
    this.bestScore.num = bestScore
    this.setScoreEle('bestScore')
  }

  /**
   * setSpeaker
   * 设置扬声器状态(执行一次取反)
   * @param {HTMLElement} target 扬声器dom
   * @memberof Control
   */
  setSpeaker(target: HTMLElement) {
    this.speaker = !this.speaker
    const className = this.speaker ? 'btns__speaker--on' : 'btns__speaker--off'
    target.className = className
  }

  /**
   * move
   * 移动函数 (根据keyCode判断移动方向)
   * @param {number} keyCode 键盘码
   * @memberof Control
   */
  move(keyCode: number) {
    const { board, speaker, audioMove, audioPopup } = this
    const prevMap: number[][] = JSON.parse(JSON.stringify(board.map))

    if (board.checkGameOver()) { // 检测游戏是否结束
      this.maskEle.className = 'mask--show'
      return
    }

    // 执行移动函数并返回能否移动结果
    const isMove: boolean = board.runMove(keyCode, prevMap)

    if (isMove) {
      board.render()
      speaker && audioMove.play()
      this.moveState = true    
      this.updateBestScore()

      // 存储当前局势到LocalStorage
      const { bestScore } = store.fetch('2048')
      store.save('2048', {
        map: this.board.map,
        score: this.score.num,
        bestScore: this.bestScore.num
      })

      setTimeout(() => {
        board.generateRandomCell()
        speaker && audioPopup.play()
        this.moveState = false
      }, 250)
    }
  }

  /**
   * keyHandel
   * 键盘事件处理
   * @memberof Control
   */
  keyHandel = (e) => {
    const { board } = this
    const { keyCode } = e

    if (Object.keys(moveConfig).includes(`${keyCode}`)) // 判断是否是上下左右
      this.move(keyCode)
  }

  /**
   * clickHandle
   * 点击事件处理
   * @memberof Control
   */
  clickHandle = (e: MouseEvent) => {
    const target = e.target as HTMLElement

    if (target.nodeName === 'BUTTON') {
      const eventFn: Function = {  // 根据类名拿到处理函数
        'btns__speaker--on': this.setSpeaker,
        'btns__speaker--off': this.setSpeaker,
        'btns__reset': this.reset
      }[target.className]

      eventFn && eventFn.call(this, target)
    }
  }

  /**
   * touchHandle
   * 触摸事件处理
   * @memberof Control
   */
  touchHandle = (e: TouchEvent) => {
    e.preventDefault()
    
    if (e.type === 'touchstart') {
      this.touch.x = e.touches[0].pageX
      this.touch.y = e.touches[0].pageY
    } else {
      const { x, y } = this.touch
      const endx = e.changedTouches[0].pageX
      const endy = e.changedTouches[0].pageY
      const direction = getDirection(x, y, endx, endy) // 拿到滑动方向 1向上 2向下 3向左 4向右
      const keyCode = { 1: 38, 2: 40, 3: 37, 4: 39 }[direction] // 根据滑动方向拿到对应的keyCode

      if (Object.keys(moveConfig).includes(`${keyCode}`)) // 判断是否是上下左右
        this.move(keyCode)
    }
  }

  /**
   * setEventBind
   * 事件绑定函数
   * @memberof Control
   */
  setEventBind() {
    addEvent(this.btnBox, 'click', this.clickHandle)
    addEvent(this.maskEle, 'click', this.clickHandle)
    addEvent(this.ele, 'touchstart', this.touchHandle)
    addEvent(this.ele, 'touchend', this.touchHandle)
    addEvent(document, 'keydown', this.keyHandel)
  }

}