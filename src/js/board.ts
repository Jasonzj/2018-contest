interface Cell {
  x: number,
  y: number,
  number: number
}

export const moveConfig: Object = {  // keycode对应方向的移动函数数组对象
  37: ['shiftLeft', 'combinLeft'],
  38: ['rotateLeft', 'shiftLeft', 'combinLeft', 'rotateRight'],
  39: ['shiftRight', 'combinRight'],
  40: ['rotateLeft', 'shiftRight', 'combinRight', 'rotateRight']
}

/**
 * Board
 * 游戏对象
 * @class Board
 */
export default class Board {  
  eleMap: HTMLTableCellElement[][]  // 二维数组dom地图(矩阵) 
  map: number[][] = [               // 二维数组数字地图(矩阵)
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]

  /**
   * Creates an instance of Board.
   * @param {HTMLTableElement} ele 游戏区域board Dom元素
   * @param {Function} setScore 设置得分函数
   * @memberof Board
   */
  constructor(
    public ele: HTMLTableElement,
    public setScore: Function
  ) {}

  /**
   * init
   * 初始化游戏
   * @param {boolean} isInitCellMap 是否初始化Dom地图
   * @param {number[][]} [map] 二维数组数字地图(矩阵)
   * @memberof Board
   */
  init(isInitCellMap: boolean, map?: number[][]) {
    isInitCellMap && this.initCellMap()

    // 参数map存在则localStorage有数据，更新this.map并渲染
    if (map) {
      this.map = map
      this.render()
    } else { // 生成二个随机方块(Cell)
      this.generateRandomCell()
      this.generateRandomCell()
    }
  }

  /**
   * clearCell
   * 清除方块(Cell) 并重置坐标
   * @param {boolean} [isSetMap=true] 是否重置坐标
   * @memberof Board
   */
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

  /**
   * initCellMap
   * 初始化二维数组dom地图(矩阵) 与map对应
   * @memberof Board
   */
  initCellMap() {
    const { ele } = this
    const trs = Array.from(ele.querySelectorAll('tr'))
    const tds = Array.from(ele.querySelectorAll('td'))
    this.eleMap = trs.map((tr, i) => tds.splice(0, 4))
  }

  /**
   * runMove
   * 运行移动函数 (根据keyCode来调用运行移动函数数组)
   * @param {number} keyCode 键盘码
   * @param {number[][]} prevMap 前一个map (根据prevMap判断map是否改变)
   * @param {boolean} [isCheck=false] 是否是判断能否移动 (根据isCheck来区分运行和检查)
   * @returns {boolean} 是否可以移动
   * @memberof Board
   */
  runMove(
    keyCode: number, 
    prevMap: number[][], 
    isCheck: boolean = false
  ): boolean {
    moveConfig[keyCode].forEach(method => this[method](isCheck))
    const isMove = this.isBoardMove(prevMap, this.map)

    return isMove
  }

  /**
   * checkGameOver
   * 检查游戏是否结束
   * @returns 游戏结果 (true为游戏结束)
   * @memberof Board
   */
  checkGameOver() {
    const prevMap: number[][] = JSON.parse(JSON.stringify(this.map))    

    // 将每个方向能否移动的结果存进数组
    const isMoves: boolean[] = Object.keys(moveConfig)
      .map(keyCode => this.runMove(parseInt(keyCode), prevMap, true))

    this.map = prevMap
    return isMoves.every(item => !item)
  }

  /**
   * setMap
   * 设置map方块值
   * @param {number} x x坐标
   * @param {number} y y坐标
   * @param {number} number 需要修改的值
   * @memberof Board
   */
  setMap(x: number, y: number, number: number) {
    this.map[x][y] = number
  }

  /**
   * generateRandomCell
   * 生成随机方块(Cell)
   * @memberof Board
   */
  generateRandomCell() {
    const cell: Cell = this.getRandomCell()
    this.setMap(cell.x, cell.y, cell.number)
    this.render(cell.x, cell.y, cell.number)
  }

  /**
   * getRandomCell
   * 获取随机方块(Cell)坐标和数字(2或4)
   * @returns {Cell} 方块(Cell)坐标和数字对象
   * @memberof Board
   */
  getRandomCell(): Cell {
    const randomX: number = Math.floor(Math.random() * 4)
    const randomY: number = Math.floor(Math.random() * 4)
    const randomNumber: number = Math.random() < 0.5 ? 2 : 4

    return this.map[randomX][randomY] === 0 
      ? { x: randomX, y: randomY, number: randomNumber }
      : this.getRandomCell()
  }

  /**
   * isBoardMove
   * 判断调用移动函数后map是否改变
   * @param {number[][]} prevMap 前一个map
   * @param {number[][]} map 移动后的map
   * @returns 是否改变 (true为可以移动)
   * @memberof Board
   */
  isBoardMove(prevMap: number[][], map: number[][]) {
    return JSON.stringify(prevMap) !== JSON.stringify(map)
  }

  /**
   * rotateRight
   * map向右旋转
   * @memberof Board
   */
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

  /**
   * rotateLeft
   * map向左旋转
   * @memberof Board
   */
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

  /**
   * combinRight
   * 向右合并数字
   * @param {boolean} isCheck 是否正在检查gameover (检查中不能修改分数)
   * @memberof Board
   */
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
  
  /**
   * combinLeft
   * 向左合并数字
   * @param {boolean} isCheck 是否正在检查gameover (检查中不能修改分数)
   * @memberof Board
   */
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

  /**
   * shiftRight
   * 向右位移
   * @memberof Board
   */
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

  /**
   * shiftLeft
   * 向左位移
   * @memberof Board
   */
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

  /**
   * render
   * 渲染函数 根据参数判断渲染方式 (参数存在为单个渲染)
   * @param {number} [x] x坐标
   * @param {number} [y] y坐标
   * @param {number} [number] 需要渲染的值
   * @memberof Board
   */
  render(x?: number, y?: number, number?: number) {
    number 
      ? this.renderOneCell(x, y, number)
      : this.renderAllCell()
  }

  /**
   * renderOneCell
   * 单个方块(Cell)渲染
   * @param {number} x x坐标
   * @param {number} y y坐标
   * @param {number} number 需要渲染的值
   * @memberof Board
   */
  renderOneCell(x: number, y: number, number: number) {
    const cur = this.eleMap[x][y]
    cur.innerHTML = `${number}`
    cur.classList.add(`board__cell--${number}`)
  }

  /**
   * renderAllCell
   * 全部方块(Cell)渲染
   * @memberof Board
   */
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