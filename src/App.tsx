import { makeAutoObservable, action } from "mobx";
import { observer, useLocalObservable } from "mobx-react-lite";
import { createContext, useContext } from "react";

// Cell class to make each cell observable
class Cell {
  alive: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  toggle() {
    this.alive = !this.alive;
  }

  setAlive(value: boolean) {
    this.alive = value;
  }
}

// MobX Store
class GameOfLifeStore {
  grid: Cell[][] = Array(10)
    .fill(null)
    .map(() =>
      Array(10)
        .fill(null)
        .map(() => new Cell())
    );

  constructor() {
    makeAutoObservable(this);
    this.grid[3][1].setAlive(true);
    this.grid[3][2].setAlive(true);
    this.grid[3][3].setAlive(true);
  }

  toggleCell = (row: number, col: number) => {
    this.grid[row][col].toggle();
  };

  nextState = () => {
    const newState = this.grid.map((row) =>
      row.map((cell) => this.getNextCellState(cell))
    );
    this.applyNewState(newState);
  };

  private getNextCellState = (cell: Cell): boolean => {
    const row = this.grid.findIndex((r) => r.includes(cell));
    const col = this.grid[row].indexOf(cell);
    const liveNeighbors = this.countLiveNeighbors(row, col);

    if (cell.alive) {
      return liveNeighbors === 2 || liveNeighbors === 3;
    } else {
      return liveNeighbors === 3;
    }
  };

  private applyNewState = action((newState: boolean[][]) => {
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        this.grid[i][j].setAlive(newState[i][j]);
      }
    }
  });

  private countLiveNeighbors = (row: number, col: number): number => {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) continue;
        const newRow = row + i;
        const newCol = col + j;
        if (newRow >= 0 && newRow < 10 && newCol >= 0 && newCol < 10) {
          count += this.grid[newRow][newCol].alive ? 1 : 0;
        }
      }
    }
    return count;
  };
}

const GameOfLifeStoreContext = createContext<GameOfLifeStore | null>(null);
GameOfLifeStoreContext.displayName = "GameOfLifeStoreContext";

// Cell Component
const CellComponent = observer(({ cell }: { cell: Cell }) => {
  return (
    <div
      onClick={() => cell.toggle()}
      style={{
        width: 20,
        height: 20,
        backgroundColor: cell.alive ? "black" : "white",
        border: "1px solid gray",
        display: "inline-block",
      }}
    />
  );
});

const Grid = observer(() => {
  const gameOfLifeStore = useContext(GameOfLifeStoreContext)!;

  return (
    <div>
      {gameOfLifeStore.grid.map((row, i) => (
        <div key={i} style={{ lineHeight: 0 }}>
          {row.map((cell, j) => (
            <CellComponent key={`${i}-${j}`} cell={cell} />
          ))}
        </div>
      ))}
    </div>
  );
});

const GameOfLife = () => {
  const gameOfLifeStore = useLocalObservable(() => new GameOfLifeStore());
  return (
    <GameOfLifeStoreContext.Provider value={gameOfLifeStore}>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Grid />
        <button onClick={() => gameOfLifeStore.nextState()}>Next State</button>
        <div style={{ height: "32px" }} />
        <a href="https://github.com/c-ehrlich/mobx-gameoflife" target="_blank">
          https://github.com/c-ehrlich/mobx-gameoflife
        </a>
      </div>
    </GameOfLifeStoreContext.Provider>
  );
};

export default GameOfLife;
