interface Cell {
  x: number,
  y: number,
  number: number
}

export const moveConfig: Object = {
  37: ['shiftLeft', 'combinLeft'],
  38: ['rotateLeft', 'shiftLeft', 'combinLeft', 'rotateRight'],
  39: ['shiftRight', 'combinRight'],
  40: ['rotateLeft', 'shiftRight', 'combinRight', 'rotateRight']
}

export default class Board {  
  eleMap: HTMLTableCellElement[][]
  map: number[][] = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
  
  constructor(
    public ele: HTMLTableElement,
    public setScore: Function
  ) {}

  init(isInitCellMap: boolean, map?: number[][]) {
    isInitCellMap && this.initCellMap()

    if (map) {
      this.map = map
      this.render()
    } else {
      this.generateRandomCell()
      this.generateRandomCell()
    }
  }

  clearCell(isSetMap: boolean = true) {
    const { map, eleMap } = this
    for (let x = 0, l = map.length; x < l; x++) {
      for (let y = 0, l = map[0].length; y < l; y++) {
        const cur = eleMap[x][y]
        if (cur.innerHTML !== '0') {
          cur.className = 'board__cell'
          cur.innerHTML = ''
          isSetMap && this.setMap(x, y, 0)
        }
      }
    }
  }

  initCellMap() {
    const { ele } = this
    const trs = Array.from(ele.querySelectorAll('tr'))
    const tds = Array.from(ele.querySelectorAll('td'))
    this.eleMap = trs.map((tr, i) => tds.splice(0, 4))
  }

  runMove(
    keyCode: number, 
    prevMap: number[][], 
    isCheck: boolean = false
  ): boolean {
    moveConfig[keyCode].forEach(method => this[method](isCheck))
    const isMove = this.isBoardMove(prevMap, this.map)

    return isMove
  }

  checkGameOver() {
    const prevMap: number[][] = JSON.parse(JSON.stringify(this.map))    

    const isMoves: boolean[] = [
      this.runMove(37, prevMap, true),
      this.runMove(38, prevMap, true),
      this.runMove(39, prevMap, true),
      this.runMove(40, prevMap, true)
    ]

    this.map = prevMap
    return isMoves.every(item => !item)
  }

  setMap(x: number, y: number, number: number) {
    this.map[x][y] = number
  }

  generateRandomCell() {
    const cell: Cell = this.getRandomCell()
    this.setMap(cell.x, cell.y, cell.number)
    this.render(cell.x, cell.y, cell.number)
  }

  getRandomCell(): Cell {
    const randomX: number = Math.floor(Math.random() * 4)
    const randomY: number = Math.floor(Math.random() * 4)
    const randomNumber: number = Math.random() < 0.5 ? 2 : 4

    return this.map[randomX][randomY] === 0 
      ? { x: randomX, y: randomY, number: randomNumber }
      : this.getRandomCell()
  }

  isBoardMove(prevMap: number[][], map: number[][]) {
    return JSON.stringify(prevMap) !== JSON.stringify(map)
  }

  rotateRight() {
    const { map } = this
    const newMap = []
    const len = map.length
    
    for (let y = 0; y < len; y++) {
      const newRow = []
      for (let x = 0; x < len; x++) {
        newRow.unshift(map[x][y])
      }
      newMap.push(newRow)
    }

    this.map = newMap
  }

  rotateLeft() {
    const { map } = this
    const newMap = []
    const len = map.length - 1

    for (let y = len; y >= 0; y--) {
      const newRow = []
      for (let x = len; x >= 0; x--) {
        newRow.unshift(map[x][y])
      }
      newMap.push(newRow)
    }

    this.map = newMap
  }

  combinRight(isCheck: boolean) {
    const { map } = this
    const len = map.length

    for (let x = 0; x < len; x++) {
      for (let y = len - 1; y >= 0; y--) {
        if (map[x][y] > 0 && map[x][y] === map[x][y - 1]) {
          map[x][y] *= 2
          map[x][y - 1] = 0
          !isCheck && this.setScore('score', map[x][y])
        } else if (map[x][y] === 0 && map[x][y - 1] > 0) {
          map[x][y] = map[x][y - 1]
          map[x][y - 1] = 0
        }
      }
    }
  }

  combinLeft(isCheck: boolean) {
    const { map } = this
    const len = map.length

    for (let x = 0; x < len; x++) {
      for (let y = 0; y < len; y++) {
        if (map[x][y] > 0 && map[x][y] === map[x][y + 1]) {
          map[x][y] *= 2
          map[x][y + 1] = 0
          !isCheck && this.setScore('score', map[x][y])
        } else if (map[x][y] === 0 && map[x][y + 1] > 0) {
          map[x][y] = map[x][y + 1]
          map[x][y + 1] = 0
        }
      }
    }
  }

  shiftRight() {
    const { map } = this
    const len = map.length

    for (let x = 0; x < len; x++) {
      const newRow = []
      for (let y = 0; y < len; y++) {
        const curr = map[x][y]
        curr === 0
          ? newRow.unshift(curr)
          : newRow.push(curr)
      }
      map[x] = newRow
    }
  }

  shiftLeft() {
    const { map } = this
    const len = map.length

    for (let x = 0; x < len; x++) {
      const newRow = []
      for (let y = len - 1; y >=0; y--) {
        const curr = map[x][y]
        curr === 0 
          ? newRow.push(curr)
          : newRow.unshift(curr)
      }
      map[x] = newRow
    }
  }

  render(x?: number, y?: number, number?: number) {
    number 
      ? this.renderOneCell(x, y, number)
      : this.renderAllCell()
  }

  renderOneCell(x: number, y: number, number: number) {
    const cur = this.eleMap[x][y]
    cur.innerHTML = `${number}`
    cur.classList.add(`board__cell--${number}`)
  }

  renderAllCell() {
    const { map, eleMap } = this

    this.clearCell(false)

    for (let x = 0, l = map.length; x < l; x++) {
      for (let y = 0, l = map[0].length; y < l; y++) {
        if (map[x][y] > 0) {
          const cur = map[x][y]
          const curEle = eleMap[x][y]
          curEle.classList.add(`board__cell--${cur}`)
          curEle.innerHTML = `${cur}`
        }
      }
    }
  }
}