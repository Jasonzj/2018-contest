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

  constructor(
    ele: HTMLTableElement,
    btnBox: HTMLElement,
    scoreEle: HTMLElement,
    scoreBestEle: HTMLElement,
    maskEle: HTMLElement
  ) {
    this.ele = ele
    this.btnBox = btnBox
    this.speaker = true
    this.moveState = false
    this.board = new Board(ele, this.setScore)
    this.audioMove = new Audio(moveAudio)
    this.audioPopup = new Audio(popAudio)
    this.score = { num: 0, ele: scoreEle }
    this.bestScore = { num: 0, ele: scoreBestEle }
    this.touch = { x: 0, y: 0 }
    this.maskEle = maskEle
    
    this.init()
  }

  init() {
    const { map, score, bestScore } = store.fetch('2048')
    
    this.setEventBind()
    
    bestScore && this.setScore('bestScore', bestScore)

    if (score) {
      this.board.init(true, map)
      this.setScore('score', score)
    } else {
      this.board.init(true)
    }
  }

  reset() {
    const { board } = this
    board.clearCell()
    board.init(false)
    this.setScore('score')
    this.maskEle.className = 'mask'
    store.save('2048', { bestScore: this.bestScore.num })
  }

  setScore = (scoreName: string, num?: number) => {
    num 
      ? this[scoreName].num += num
      : this[scoreName].num = 0
    
    this.setScoreEle(scoreName)
  }

  setScoreEle(scoreName) {
    this[scoreName].ele.innerHTML = `${this[scoreName].num}`
  }

  updateBestScore() {
    const { score: { num }, bestScore: { num: bestNum } } = this
    const bestScore = num >= bestNum ? num : bestNum
    this.bestScore.num = bestScore
    this.setScoreEle('bestScore')
  }

  setSpeaker(target: HTMLElement) {
    this.speaker = !this.speaker
    const className = this.speaker ? 'btns__speaker--on' : 'btns__speaker--off'
    target.className = className
  }

  move(keyCode: number) {
    const { board, speaker, audioMove, audioPopup } = this
    const prevMap: number[][] = JSON.parse(JSON.stringify(board.map))

    if (board.checkGameOver()) {
      this.maskEle.className = 'mask--show'
    }

    const isMove: boolean = board.runMove(keyCode, prevMap)

    if (isMove) {
      board.render()
      speaker && audioMove.play()
      this.moveState = true    
      this.updateBestScore()

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

  keyHandel = (e) => {
    const { board } = this
    const { keyCode } = e

    if (Object.keys(moveConfig).includes(`${keyCode}`))
      this.move(keyCode)
  }

  clickHandle = (e: MouseEvent) => {
    const target = e.target as HTMLElement

    if (target.nodeName === 'BUTTON') {
      const eventFn: Function = {
        'btns__speaker--on': this.setSpeaker,
        'btns__speaker--off': this.setSpeaker,
        'btns__reset': this.reset
      }[target.className]

      eventFn && eventFn.call(this, target)
    }
  }

  touchHandle = (e: TouchEvent) => {
    e.preventDefault()
    if (e.type === 'touchstart') {
      this.touch.x = e.touches[0].pageX
      this.touch.y = e.touches[0].pageY
    } else {
      const { x, y } = this.touch
      const endx = e.changedTouches[0].pageX
      const endy = e.changedTouches[0].pageY
      const direction = getDirection(x, y, endx, endy)
      const keyCode = { 1: 38, 2: 40, 3: 37, 4: 39 }[direction]
      if (Object.keys(moveConfig).includes(`${keyCode}`))
        this.move(keyCode)
    }
  }

  setEventBind() {
    addEvent(this.btnBox, 'click', this.clickHandle)
    addEvent(this.maskEle, 'click', this.clickHandle)
    addEvent(document, 'keydown', this.keyHandel)
    addEvent(this.ele, 'touchstart', this.touchHandle)
    addEvent(this.ele, 'touchend', this.touchHandle)
  }

}