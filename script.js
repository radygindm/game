const startGame = document.querySelector('.js-start-game');
const playerFields = document.querySelectorAll('.js-player-field');
const screenOne = document.querySelector('.screen_one');
const screenTwo = document.querySelector('.screen_two');
const finalScreen = document.querySelector('.screen_final');

// массив игроков
let players = [];
// массив расположения кораблей
let locations = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];
// создается два объекта для каждого игрока(у каждого своя модель поведения)
// проверят на заполненнсоть полей
startGame.addEventListener('click', function () {
    playerFields.forEach(function (field, i) { // проверка на корректную заполненность полей
        if (field.value.trim()) {
            const table = document.querySelectorAll('.playground')[i]; // имеем в разметке две таблицы
            const name = table.closest('.place').querySelector('.name'); // поле с именем игрока
            players.push(Object.create(Object.assign({}, model))); // создаем в массив с игроками копии объекта model
            players[i].playerName = field.value.trim(); // присваиваем имя игрокам
            players[i].locations = JSON.parse(JSON.stringify(locations)); // выполняем глубокое копирование массива
            name.innerHTML = `Ход игрока: ${field.value.trim()}` // передаем имя в разметку
            players[i].playground = table; // присваиваем игровое поле
        } else {
            alert('Поле имя пустое');
            players = [];
        }
    });
    // если два игрока созданы, передает ход первому игроку
    if (players.length === 2) {
        players.forEach(function (player) {
            // console.log(player);
            player.init();
        });
        screenOne.classList.toggle('active');
        screenTwo.classList.toggle('active');
    }
});
// основная логика игры
let model = {
    countHit: 0, // кол-во попаданий
    playerName: '', // имя игрока
    playground: null, // игровые поля
    locations: [], // игровое поле игрока
    boardSize: 10, // кол-во кораблей на игровом поле
    oneBoard: {
        countBoard: 4,
        sizeBoard: 1,
    }, // количество однопалубных кораблей
    twoBoard: {
        countBoard: 3,
        sizeBoard: 2,
    }, // количество двухпалубных кораблей
    treeBoard: {
        countBoard: 2,
        sizeBoard: 3,
    }, // количество трехпалубных кораблей
    fourBoard: {
        countBoard: 1,
        sizeBoard: 4,
    }, // количество четырех палубных кораблей
    // метод выстрела
    fire: function () {
        const _this = this; // сохранение контекста для текущего поля
        const cells = this.playground.querySelectorAll('td'); // ячейки игрового поля

        cells.forEach(function (cell) {
            cell.addEventListener('click', function () {
                const coords = this.dataset.id.split(','); // вносим координаты в массив

                // проверка на попадание (если попали меняем 2 на 3, ход остается у игрока, помечаем попадание)
                // если промазали помечаем точкой, ход переходит к следующему игроку
                if (_this.locations[+coords[0]][+coords[1]] === 2) {
                    _this.locations[+coords[0]][+coords[1]] = 3;
                    this.classList.add('hit');
                    this.style.pointerEvents = 'none';
                    _this.countHit = _this.countHit + 1;
                    if(_this.countHit >= 20){
                        screenTwo.classList.toggle('active')
                        finalScreen.classList.toggle('active')
                        document.querySelector('#final-text').innerHTML = `Поздавляем игрока ${_this.playerName} с победой!!!`
                    }
                } else {
                    this.classList.add('miss');
                    this.style.pointerEvents = 'none';

                    let nextPlayer = players.find(player => player.playerName !== _this.playerName); // находим игрока с другим именем
                    nextPlayer.playground.closest('.place').classList.add('active');
                    _this.playground.closest('.place').classList.remove('active');
                }
            });
        });
    },
    // метод создает все корабли на игровом поле
    generateAllBoard: function () {
        this.generateShipLocations(this.fourBoard);
        this.generateShipLocations(this.treeBoard);
        this.generateShipLocations(this.twoBoard);
        this.generateShipLocations(this.oneBoard);
    },
    // запись координат корабля в массив
    generateShipLocations: function(board) {
        for (let i = 0; i < board.countBoard; i++) {
            this.generateShip(board);
        }
    },

    // создание одного корабля
    generateShip: function(board) {
        let direction = Math.ceil(Math.random() * 2);
        let row, col;
        if (direction === 1) { // horizontal
            do { // создаем корабли до тех пор, пока не будет колизии
                row = Math.floor(Math.random() * (this.boardSize - 1));
                col = Math.floor(Math.random() * (this.boardSize - board.sizeBoard));
            } while (this.collision([row, col], board.sizeBoard, direction))
        } else { // vertical
            do { // создаем корабли до тех пор, пока не будет колизии
                row = Math.floor(Math.random() * (this.boardSize - board.sizeBoard));
                col = Math.floor(Math.random() * (this.boardSize - 1));
            } while (this.collision([row, col], board.sizeBoard, direction))
        }

        for (let i = 0; i < board.sizeBoard; i++) {
            if (direction === 1) {
                let square = this.playground.querySelector(`[data-id="${row},${col + i}"]`);
                this.locations[row][col + i] = 2;
                // square.style.background = 'green'; // посмотреть расположение кораблей на игровом поле
            } else {
                let square = this.playground.querySelector(`[data-id="${row + i},${col}"]`);
                this.locations[row + i][col] = 2;
                // square.style.background = 'green'; // посмотреть расположение кораблей на игровом поле
            }
        }
        // debugger;
        this.createRectangle([row, col], direction, board.sizeBoard); // создаем вокруг корабля кокон из единиц
    },
    // метод получает один корабль и проверяет, что тот не перекрывается с другими кораблями
    collision: function(coords, sizeBoard, direction) {
        let isCollision = false;
        for (let i = 0; i < sizeBoard; i++) {
            if (direction === 1) {
                if (this.locations[coords[0]][coords[1] + i] > 0) {
                    isCollision = true;
                }
            } else {
                if (this.locations[coords[0] + i][coords[1]] > 0) {
                    isCollision = true;
                }
            }
        }
        return isCollision;
    },

    // метод создает вокруг корабля прямоугольник из единиц (для дальнейшей проверки на соприкосновение кораблей друг с другом)
    createRectangle: function(coords, direction, boardSize) {
        const lineSize = boardSize + 2;


        if (direction === 1) {
            if (this.locations[coords[0]][coords[1] - 1] !== undefined) {
                this.locations[coords[0]][coords[1] - 1] = 1;
            }
            if (this.locations[coords[0]][coords[1] + boardSize] !== undefined) {
                this.locations[coords[0]][coords[1] + boardSize] = 1;
            }

        } else {
            if (this.locations[coords[0] - 1] && this.locations[coords[0] - 1][coords[1]] !== undefined) {
                this.locations[coords[0] - 1][coords[1]] = 1;
            }

            if (this.locations[coords[0] + boardSize][coords[1]] !== undefined) {
                this.locations[coords[0] + boardSize][coords[1]] = 1;
            }
        }

        for (let i = 0; i < lineSize; i++) {
            if (direction === 1) {
                if (this.locations[coords[0] - 1] && this.locations[coords[0] - 1][coords[1] + (i - 1)] !== undefined) {
                    this.locations[coords[0] - 1][coords[1] + (i - 1)] = 1;
                }
                if (this.locations[coords[0] + 1][coords[1] + (i - 1)] !== undefined) {
                    this.locations[coords[0] + 1][coords[1] + (i - 1)] = 1;
                }
            } else {
                if (this.locations[coords[0] + (i - 1)] && this.locations[coords[0] + (i - 1)][coords[1] - 1] !== undefined) {
                    this.locations[coords[0] + (i - 1)][coords[1] - 1] = 1;
                }
                if (this.locations[coords[0] + (i - 1)] && this.locations[coords[0] + (i - 1)][coords[1] + 1] !== undefined) {
                    this.locations[coords[0] + (i - 1)][coords[1] + 1] = 1;
                }
            }
        }
    },

    // запускает создание кораблей и метод выстрела
    init: function () {
        this.generateAllBoard();
        this.fire();
    }
};