const BORDER_WIDTH = 1;

class Matrix {
  constructor(colors = ['black', 'white'], size = 50, radius = 2) {
    this.numberIterations = 0;
    this.colors = colors;
    this.size = size;
    this.state = randomMatrix(size, size, this.colors);
    this.squareSize = H_100 / this.state.length;
    this.radius = radius;
    this.stable = false;
    this.stats = {};

    this.draw();
    this.updateStatistics();
  }

  reset() {
    this.numberIterations = 0;
    this.state = randomMatrix(this.size, this.size, this.colors);
    this.stable = false;
    this.stats = {};
    this.draw();
    this.updateStatistics();
  }

  update() {
    this.numberIterations++;
    this.nextState();
    this.draw();
    this.updateStatistics();
  }

  formatPercentage(n) {
    const p = n ? (n * 100) / this.size ** 2 : 0;
    return p.toFixed(2);
  }

  formatChange(prev, next) {
    if (prev) {
      return next > prev ? '↑' : '↓';
    }
    return '-';
  }

  updateStatistics() {
    const previous = this.stats;
    const results = this.countAll();

    $iterations.innerText = this.numberIterations;

    this.colors.forEach((color) => {
      const $count = document.getElementById(colorCountId(color));
      $count.innerText = results[color] || 0;

      const $percentage = document.getElementById(colorPercentageId(color));
      $percentage.innerText = this.formatPercentage(results[color]);

      const $change = document.getElementById(colorChangeId(color));
      $change.innerText = this.formatChange(previous[color], results[color]);
    });

    this.stats = results;
  }

  draw() {
    ctx.save();
    ctx.clearRect(0, 0, W_100, H_100);

    for (let row = 0; row < this.state.length; row++) {
      for (let col = 0; col < this.state[row].length; col++) {
        this.drawSquare(row, col);
      }
    }
    ctx.restore();
  }

  drawSquare(row, col) {
    const color = this.state[row][col];
    ctx.save();
    ctx.fillStyle = color;
    ctx.translate(this.squareSize * col, this.squareSize * row);
    ctx.fillRect(
      BORDER_WIDTH,
      BORDER_WIDTH,
      this.squareSize - 2 * BORDER_WIDTH,
      this.squareSize - 2 * BORDER_WIDTH
    );

    ctx.restore();
  }

  countAll() {
    const rows = this.state.length;
    const cols = this.state[0].length;

    const results = {};

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const value = this.state[row][col];
        if (results[value]) {
          results[value]++;
        } else {
          results[value] = 1;
        }
      }
    }
    return results;
  }

  majority() {
    return ((2 * this.radius + 1) ** 2 - 1) / 2;
  }

  most(results) {
    const entries = Object.entries(results);
    let threshold = 3;
    let winners = [];

    entries.forEach(([state, count]) => {
      if (count > threshold) {
        threshold = count;
        winners = [state];
      } else if (count === threshold) {
        winners.push(state);
      }
    });

    return winners;
  }

  determine(winners) {
    return winners.length === 1 ? winners[0] : undefined;
  }

  neighbors(row_0, col_0) {
    if (row_0 === 2 && col_0 === 2) {
    }
    const matrix = this.state;
    const l = matrix.length;
    const radius = this.radius;
    const results = {};

    for (let row = -radius; row <= radius; row++) {
      for (let col = -radius; col <= radius; col++) {
        // if (row === 0 && col === 0) continue;
        // if (Math.abs(row) !== Math.abs(col)) continue;
        // if (row % 2 === 1 && Math.abs(col % 2) === 1) continue;
        // if (Math.abs(row) <= 1 || Math.abs(col) <= 3) continue;
        if (row % 3 !== 0 && col % 3 !== 0) continue;

        const value = matrix[mod(row_0 + row, l)][mod(col_0 + col, l)];
        if (results[value]) {
          results[value]++;
        } else {
          results[value] = 1;
        }
      }
    }

    return results;
  }

  nextValue(row, col) {
    return this.determine(this.most(this.neighbors(row, col)));
  }

  nextState() {
    const rows = this.state.length;
    const cols = this.state[0].length;

    const result = emptyMatrix(rows, cols);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const r = this.nextValue(row, col);
        if (r) {
          result[row][col] = r;
        } else {
          result[row][col] = this.state[row][col];
        }
      }
    }

    if (areMatricesEqual(this.state, result)) {
      this.stable = true;
    }

    this.state = result;
  }
}
