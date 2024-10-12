// Game settings
var gamemode = 'Gem Grab';
var theme = 0;
var size = '21×33 (Regular)';
var zoomed = 80;

// Map and tile settings
var mapCode = Array.from({ length: 33 }, () => new Array(21).fill('.'));
window.mapCode = mapCode;
var path = './Resources/Desert';
var tileSelected = '.';
const mirroring = [false, false, false];

// Tile characteristics
const fourChars = ['c', 'd', 'e', 'f', 'y'];
const jumpChars = ['H', 'G', 'L', 'K', 'P', 'Z', 'O', 'U'];
const spawnChars = ['1', '2'];
const smallChars = ['z', 'w', 'W'];
const arrangedTiles = ['W', 'N', 'a'];
const regularFenceEnvs = [0, 1, 2, 3, 4, 5, 19];
const almostRegularFenceEnvs = [6, 8, 10, 11, 16, 23, 38];
const chainFenceEnvs = [12];
const blocks = ['M', 'X', 'Y', 'C', 'T', 'N', 'W', 'a', 'B', 'I', 'J'];
const normalMines = [0, 1, 2, 3, 4, 8, 11, 19];
const cityMines = [5, 6, 10, 12, 16, 23, 38];
const largeSkulls = [1, 12];

// Spawn settings
const regularSpawns = [8, 10, 12];
const siegeSpawns = [11, 13, 15];
const volleySpawns = [8, 10, 12];
const basketSpawns = [6, 8, 10];

// Brawl ball tiles
var brawlBallTiles = [];

// Editing tools state
var eraser = false;
var replacer = false;
var errorer = false;
var select = 1;
var mirroringBlocked = false;
var rightclicking = false;
var areaSelecting = false;
var dragging = false;
var multiSelecting = false;
var multiDragging = false;
var multiDraggingClicking = false;
var lineSelecting = false;
var rectSelecting = false;
var pasting = false;
var placing = false;
var cleaned = false;
var erased = false;

// Action tracking
var actionsStack = [];
var undoneActionsStack = [];
var savedVersions = [];
var selectedTiles = [];
var lastTiles = [];
var alreadyPlaced = [];
var copiedTiles = [];
var lastChecked;

// Initial and last tile states
var initialTile = '';
var lastTile = '';
var lastChar = '';
var initialChar = '';

// Replace settings
var replaceFrom = null, replaceTo = null;

// Input states
var mouseup = true;

// Tile dimensions
var rows, columns, tileWidthPercent, tileHeightPercent;


const tileSizes = {
    "M": [1, 1.75, 0, -30],          //Wall
    "X": [1, 1.75, 0, -30],          //Secondary Wall
    "Y": [1, 1.8, 0, -30],           //Crate
    "C": [1, 1.69, 0, -30],          //Barrel
    "F": [1, 1.8, 0, -30],           //Bush
    "T": [1, 1.67, 0, -30],          //Cactus
    "B": [1, 1.08, 0, 0],            //Skulls
    "I": [1, 1.75, 0, -30],          //Unbreakable
    "N": [1, 1.75, 0, -30],          //Fence
    "W": [1, 1, 0, 0],               //Water
    "a": [1, 1.75, 0, -30],          //Rope Fence
    "1": [1.7, 1.7, -17, -17, 15],   //Blue Spawn
    "2": [1.7, 1.7, -17, -17, 15],   //Red Spawn
    "8": [1, 1, 0, 0],               //Special Objective Placeholder
    "G": [2, 2.24, 0, 0],            //Jumppad ←
    "H": [2, 2.24, 0, 0],            //Jumppad →
    "L": [2, 2.24, 0, 0],            //Jumppad ↓
    "K": [2, 2.24, 0, 0],            //Jumppad ↑
    "Z": [2, 2.24, 0, 0],            //Jumppad ↖
    "U": [2, 2.24, 0, 0],            //Jumppad ↗
    "P": [2, 2.24, 0, 0],            //Jumppad ↘
    "O": [2, 2.24, 0, 0],            //Jumppad ↙
    "c": [2, 2, 0, 0],               //Teleporter Blue
    "d": [2, 2, 0, 0],               //Teleporter Green
    "e": [2, 2, 0, 0],               //Teleporter Red
    "f": [2, 2, 0, 0],               //Teleporter Yellow
    "z": [1, 1.11, 0, 0],            //Slow Tile
    "w": [1, 1.11, 0, 0],            //Speed Tile
    "y": [2, 2.26, 0, 0],            //Heal Pad
    "x": [1.5, 1.65, -10, -25],      //Smoke
    "v": [1, 1.5, 0, -15],           //Spikes
    "b": [1, 1, 0, 0],               //Payload Track
    "g": [1, 1.18, 0, 0],            //Siege Bolt
    "4": [1, 1.75, 0, -30],          //Showdown Box
    "o": [1, 1.67, 0, -30]           //Brawl Ball Bumpers
}


class Tile {
    constructor(row, col, button) {
        this.row = row;
        this.col = col;
        this.char = '.';
        this.button = button;
    }

    upper;
    image;

    duplicate() {
        let tile = new Tile(this.row, this.col, this.button);
        tile.char = this.char;
        tile.upper = this.upper;
        tile.image = this.image;
        return tile;
    }
}

class Node {
    constructor(bool){
        this.bool = bool;
    }
    next;
}


window.onload = function () {
    generateMap();
    chooseTile(document.getElementById('M'), 'M');
    selectGamemode('Gem Grab');
};

document.addEventListener('keydown', function (e) {

    var activeElement = document.activeElement;
    var tagName = activeElement.tagName.toLowerCase();
    var inputType = activeElement.type ? activeElement.type.toLowerCase() : '';

    if (tagName !== 'input' || (tagName === 'input' && inputType !== 'text' && inputType !== 'textarea')) {
        if (e.ctrlKey) {
            switch (e.key) {
                case 'z':
                    e.preventDefault();
                    undo();
                    break;
                case 's':
                    e.preventDefault();
                    window.saveMap();
                    break;
                case 'y':
                    e.preventDefault();
                    redo();
                    break;
                case '=':
                    e.preventDefault();
                    zoom(20);
                    break;
                case '-':
                    e.preventDefault();
                    zoom(-20);
                    break;
            }
        }

        else {
            let x = false;
            switch (e.key) {
                case 'e':
                    document.getElementById('eraser').click();
                    break;
                case '1':
                    document.getElementById('select1').click();
                    break;
                case '2':
                    document.getElementById('select2').click();
                    break;
                case '3':
                    document.getElementById('select3').click();
                    break;
                case '4':
                    document.getElementById('areaSelector').click();
                    break
                case 'x':
                    x = true;
                    clean();
                    break;
                case 'c':
                    copy();
                    break;
                case 'v':
                    document.getElementById('paster').click();
                    break;
                case 'z':
                    if (!x) {
                        rotate();
                    }
                    break;
                case 'r':
                    document.getElementById('replacer').click();
                    break;
                case 'w':
                    document.getElementById('guider').click();
                    break;
                case 'q':
                    document.getElementById('errorer').click();
                    break;
                case 'm':
                    mirroringBlocked = !mirroringBlocked;
                    break;
            }
        }
    }
    
}); //keydown

document.querySelectorAll('.tile-display').forEach(tile => {
    tile.addEventListener('click', (event) => {
        if (!replacer) chooseTile(event.target, event.target.value, event);
        else {
            if (replaceFrom === null) {
                replaceFrom = tile.value;
                document.querySelectorAll('.tile-display').forEach(function (display) { display.classList.remove('tile-display-replace-from'); });
                tile.classList.add('tile-display-replace-from');
                if (!replaceTo) document.getElementById('replacerText').innerText = 'Select tile to replace to';
                else document.getElementById('replacerText').innerText = 'Click "Replace" once more to replace';
            }
            else if (replaceFrom === tile.value) {
                replaceFrom = null;
                tile.classList.remove('tile-display-replace-from');
                document.getElementById('replacerText').innerText = 'Select tile to replace from';
            }
            else if (replaceTo === tile.value) {
                replaceTo = null;
                tile.classList.remove('tile-display-replace-to');
                document.getElementById('replacerText').innerText = 'Select tile to replace to';
            }
            else {
                replaceTo = tile.value;
                document.querySelectorAll('.tile-display').forEach(function (display) { display.classList.remove('tile-display-replace-to'); });
                tile.classList.add('tile-display-replace-to');
                if (replaceFrom) document.getElementById('replacerText').innerText = 'Click "Replace" once more to replace';
                else document.getElementById('replacerText').innerText = 'Select tile to replace from';
            }
        }
    });
}); //tile display

document.addEventListener('mouseup', function () {
    mouseup = true;
}); //mouseup for document

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[type="radio"][name="openers"]').forEach(radio => killRadios(radio));


    Array.from(document.getElementById('gamemodeScroll').children).forEach((child) => {
        if (child instanceof HTMLInputElement) {
            child.addEventListener('click', function () {
                document.getElementById('moder').click();
                selectGamemode(document.querySelector(`label[for="${this.id}"]`).textContent);
            });
        }
    });

    Array.from(document.getElementById('themeScroll').children).forEach((child) => {
        if (child instanceof HTMLInputElement) {
            child.addEventListener('click', function () {
                document.getElementById('themer').click();
                theme = parseInt(this.value);
                selectTheme(document.querySelector(`label[for="${this.id}"]`).textContent);
                document.getElementById('themeDisplay').innerText = document.querySelector(`label[for="${this.id}"]`).textContent;
            });
        }
    });

    Array.from(document.getElementById('sizeScroll').children).forEach((child) => {
        if (child instanceof HTMLInputElement) {
            child.addEventListener('click', function () {
                document.getElementById('sizer').click();
                if (size !== document.querySelector(`label[for="${this.id}"]`).textContent) {
                    size = document.querySelector(`label[for="${this.id}"]`).textContent;
                    generateMap(document.querySelector(`label[for="${this.id}"]`).textContent);
                    document.getElementById('sizeDisplay').innerText = size.trim().substring(size.trim().indexOf('(') + 1, size.trim().length - 1);
                    selectGamemode(gamemode);
                    setMirror(0);
                    setMirror(0);
                }
            });
        }
    });

}); //content loaded


function setShowErr(element) {
    errorer = element.checked;
    if (errorer) showErrors();
    else { cleanUppers(); if (document.getElementById('guider').checked) showJpsLanding(); }
}

function clean() {
    if (multiDragging) {
        mapCode.forEach(function (row) {
            row.forEach(function (tile) {
                markSelected(tile.row, tile.col, true);
            });
        });
        selectedTiles = selectedTiles.filter(tile => tile[2] !== '.');
        selectedTiles.forEach(function (tile) {
            markSelected(tile[0], tile[1]);
        });
        cleaned = true;
    }
}

function copy() {
    if (multiDragging) {
        copiedTiles = [];
        let tile = selectedTiles[0];

        selectedTiles.forEach(t => {
            if (t[0] < tile[0]) {
                tile = [t[0], t[1], t[2]];
            } else if (t[0] === tile[0] && t[1] < tile[1]) {
                tile = [t[0], t[1], t[2]];
            }
        });

        selectedTiles.forEach(t => {
            copiedTiles.push([t[0] - tile[0], t[1] - tile[1], t[2]]);
        });
    }
}

function paste() {
    if (copiedTiles.length !== 0) pasting = !pasting;
    else document.getElementById('paster').checked = false;
    if (!pasting && copiedTiles.length !== 0) {
        document.getElementById('areaSelector').checked = false;
    }
    else {
        multiDragging = false;
        multiDraggingClicking = false;
        multiSelecting = false;
        areaSelecting = false;
        cleanUppers();
    }
}

function rotate() {
    if (!cleaned && multiDragging) {
        let tile = selectedTiles[0];

        selectedTiles.forEach(t => {
            if (t[0] < tile[0]) {
                tile = [t[0], t[1], t[2]];
            } else if (t[0] === tile[0] && t[1] < tile[1]) {
                tile = [t[0], t[1], t[2]];
            }
        });

        let tiles = arrayTo2D(selectedTiles);
        let arr = Array.from({ length: tiles[0].length }, () => Array(tiles.length).fill('.'));

        for (let i = 0; i < tiles.length; i++) {
            for (let j = 0; j < tiles[0].length; j++) {
                arr[j][tiles.length - 1 - i] = tiles[i][j];
            }
        }

        selectedTiles.forEach(t => {
            placeTile(t[0], t[1], undefined, undefined, undefined, undefined, true);
            markSelected(t[0], t[1], true);
        });

        selectedTiles = [];

        for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < arr[0].length; j++) {
                if (tile[0] + i < rows && tile[0] + i >= 0 && tile[1] + j < columns && tile[1] + j >= 0) {
                    placeTile(tile[0] + i, tile[1] + j, arr[i][j], undefined, undefined, undefined, false);
                    markSelected(tile[0] + i, tile[1] + j);
                    selectedTiles.push([tile[0] + i, tile[1] + j, arr[i][j]]);
                }
            }
        }
    }
}

function arrayTo2D(arr) {
    let minRow = Infinity, minCol = Infinity;
    let maxRow = 0; maxCol = 0;

    arr.forEach(a => {
        minRow = a[0] < minRow ? a[0] : minRow;
        minCol = a[1] < minCol ? a[1] : minCol;
        maxRow = a[0] > maxRow ? a[0] : maxRow;
        maxCol = a[1] > maxCol ? a[1] : maxCol;
    });

    let grid = Array.from({ length: maxRow - minRow + 1 }, () => Array.from({ length: maxCol - minCol + 1 }, () => null));

    for (let i = 0; i <= maxRow - minRow; i++) {
        for (let j = 0; j <= maxCol - minCol; j++) {
            grid[i][j] = arr.find(a => a[0] - minRow === i && a[1] - minCol === j)[2];
        }
    }

    return grid;
}

function cleanUppers() {
    mapCode.forEach(function (a) {
        a.forEach(function (tile) {
            markSelected(tile.row, tile.col, true);
        });
    });
}

function mouseUpFunc(row = 0, col = 0) {
    erased = false;
    undoneActionsStack = [];
    if (!rightclicking) {

        if (pasting) { }

        //placing
        else if (placing) {
            actionsStack.push(mapCode.map(row => row.map(tile => tile.duplicate())));
            placeTile(row, col);
            placing = false;
        }

        //dragging
        else if (dragging) {
            showGuides();
            dragging = false;
            lastTile = '';
            lastChar = '';
            cleanUppers();
            placeTile(row, col, initialChar);
            initialChar = '';
            if (errorer) showErrors();
        }

        else if (multiDraggingClicking) {
            showGuides();
            multiDragging = false;
            multiDraggingClicking = false;
            multiSelecting = false;
            document.getElementById('areaSelector').checked = false;
            areaSelecting = false;
            cleanUppers();
            selectedTiles.forEach(a => {
                placeTile(a[0], a[1], a[2], undefined, undefined, undefined, false);
            });
            if (errorer) showErrors();
        }


        else if (areaSelecting) {
            multiDragging = true;
            multiSelecting = false;
        }

        //line select / rect select
        else if (lineSelecting || rectSelecting) {
            selectedTiles.forEach(function (tile) {
                placeTile(tile[0], tile[1]);
            });
            lineSelecting = false;
            rectSelecting = false;
            alreadyPlaced = [];
            selectedTiles = [];
            initialTile = '';
            lastTile = '';
            mapCode.forEach(function (row) {
                row.forEach(function (tile) {
                    markSelected(tile.row, tile.col, true);
                });
            });
        }
        if (document.getElementById('guider').checked) {
            showJpsLanding();
        }
        if (errorer) showErrors();
    }
}

function zoom(percentage) {
    if (zoomed + percentage > 100 || zoomed + percentage < 40) return;
    zoomed += percentage;

    document.querySelectorAll('.map').forEach(function (element) {
        if (rows > columns) {
            element.style.height = `${((tileHeightPercent * rows) * zoomed / 100).toFixed(3)}%`;
            element.style.width = `${((tileHeightPercent * columns) * zoomed / 100).toFixed(3)}%`;
        }

        else {
            element.style.height = `${(tileWidthPercent * rows) * zoomed / 100}%`;
            element.style.width = `${(tileWidthPercent * columns) * zoomed / 100}%`;
        }
    });
    document.getElementById('zoomDisplay').innerText = 'Zoom (' + zoomed + '%)';
}

function areaSelect() {
    areaSelecting = document.getElementById('areaSelector').checked;
    if (!areaSelecting && pasting) document.getElementById('paster').click();
    cleanUppers();
    if (errorer) showErrors();
    document.getElementById('guider').click();
    document.getElementById('guider').click();
    multiDragging = false;
    multiDraggingClicking = false;
    multiSelecting = false;
}

function buttonListening(row, col) {
    let spot = mapCode[row][col];
    let button = spot.button;

    button.addEventListener('contextmenu', function (event) {
        event.preventDefault();
        if (spot.char !== '.') {
            tileSelected = spot.char;
            document.querySelectorAll('.tile-display').forEach(function (tileDisplay) {
                tileDisplay.classList.remove('tile-display-selected');
                if (tileDisplay.value === tileSelected) tileDisplay.classList.add('tile-display-selected');
            });
        }
    });

    button.addEventListener('mousedown', function (event) {
        if (event.button === 0) {
            rightclicking = false;
            mouseup = false;
            cleanUppers();

            if (pasting) {
                actionsStack.push(mapCode.map(row => row.map(tile => tile.duplicate())));
                copiedTiles.map(tile => [tile[0] + row, tile[1] + col, tile[2]]).forEach(tile => {
                    if (tile[0] < rows && tile[1] < columns) placeTile(tile[0], tile[1], tile[2], undefined, undefined, undefined, false);
                });
            }

            //multidragging 
            else if (multiDragging) {
                if (selectedTiles.some(tile => tile[0] === row && tile[1] === col)) {
                    actionsStack.push(mapCode.map(row => row.map(tile => tile.duplicate())));
                    initialTile = [row, col];
                    multiDraggingClicking = true;
                    cleanUppers();
                    selectedTiles.forEach(function (tile) {
                        if (!pasting) placeTile(tile[0], tile[1], undefined, undefined, undefined, undefined, true);
                        markSelected(tile[0], tile[1]);
                    });
                }
                else {
                    multiDraggingClicking = true;
                    mouseUpFunc();
                }
                multiDragging = false;
            }

            //dragging
            else if (spot.char !== '.' && !eraser && !areaSelecting) {
                actionsStack.push(mapCode.map(row => row.map(tile => tile.duplicate())));
                dragging = true;
                lastTile = [row, col];
                initialChar = spot.char;
                lastChar = '.';
                placeTile(row, col, initialChar, undefined, undefined, undefined, true);
                placeTile(row, col, initialChar, undefined, undefined, undefined, undefined, true);
            }

            //area selecting
            else if (areaSelecting) {
                multiSelecting = true;
                cleaned = false;
                selectedTiles = [];
                lastTiles = [];
                initialTile = [row, col];
                markSelected(row, col);
                selectedTiles.push([row, col]);
            }

            //erasing
            else if (eraser && select === 1) {
                if (!erased) {
                    actionsStack.push(mapCode.map(row => row.map(tile => tile.duplicate())));
                    placeTile(row, col);
                    erased = true;
                }
            }

            //placing
            else if (spot.char === '.' && select === 1) {
                placing = true;
            }

            //line select
            else if (spot.char === '.' && select === 2 || select === 2 && eraser) {
                actionsStack.push(mapCode.map(row => row.map(tile => tile.duplicate())));
                lineSelecting = true;
                selectedTiles = [];
                selectedTiles.push([row, col]);
                markSelected(row, col);
            }

            //rectangle select
            else if (spot.char === '.' && select === 3 || select === 3 && eraser) {
                actionsStack.push(mapCode.map(row => row.map(tile => tile.duplicate())));
                rectSelecting = true;
                initialTile = [row, col];
                markSelected(row, col);
                selectedTiles = [];
                selectedTiles.push([row, col]);
            }
        }
    });

    button.addEventListener('mouseup', function () {
        mouseUpFunc(row, col);
    });

    button.addEventListener('mouseleave', function () {
        if (!rightclicking) {
            //dragging
            if (dragging) {
                if (fourChars.includes(initialChar) || jumpChars.includes(initialChar)) {
                    let tiles = [[lastTile[0], lastTile[1]]];
                    
                    if (mirroring[0]) tiles.push([rows - 2 - lastTile[0], columns - 2 - lastTile[1]]);
                    if (mirroring[1]) tiles.push([rows - 2 - lastTile[0], lastTile[1]]);
                    if (mirroring[2]) tiles.push([lastTile[0], columns - 2 - lastTile[1]]);

                    tiles.forEach(function (tile) {
                        markSelected(tile[0], tile[1], true);
                    });
                }
                else {
                    let tiles = [[lastTile[0], lastTile[1]]];

                    if (mirroring[0]) tiles.push([rows - 1 - lastTile[0], columns - 1 - lastTile[1]]);
                    if (mirroring[1]) tiles.push([rows - 1 - lastTile[0], lastTile[1]]);
                    if (mirroring[2]) tiles.push([lastTile[0], columns - 1 - lastTile[1]]);

                    tiles.forEach(function (tile) {
                        markSelected(tile[0], tile[1], true);
                    });
                }
            }
        }
    });

    button.addEventListener('mouseenter', function () {
        //dragging
        if (mouseup && multiDragging) {
            mouseUpFunc(row, col);
            return;
        }

        if (dragging) {
            document.getElementById('guidesDisplay').style.display = 'block';
            lastChar = spot.char;
            lastTile = [row, col];
            placeTile(row, col, initialChar, undefined, undefined, undefined, undefined, true);
        }

        else if (multiDraggingClicking) {
            document.getElementById('guidesDisplay').style.display = 'block';
            let r = initialTile[0] - row, c = initialTile[1] - col;
            lastTiles = [];
            cleanUppers();
            selectedTiles.forEach(function (tile) {
                let ro = tile[0] - r, co = tile[1] - c;
                placeTile(ro, co, tile[2], undefined, undefined, undefined, false, true);
                markSelected(ro, co);
                tile[0] = ro;
                tile[1] = co;
            });
            initialTile = [row, col];
        }

        //line select
        else if (lineSelecting) {
            selectedTiles.push([row, col]);
            markSelected(row, col);
        }

        else if (multiSelecting && !multiDragging) {
            selectedTiles.forEach(function (tile) {
                markSelected(tile[0], tile[1], true);
            });
            selectedTiles = [];
            let tiles = getTilesInRectangle(initialTile, [row, col]);
            tiles.forEach(function (tile) {
                selectedTiles.push([tile[0], tile[1], mapCode[tile[0]][tile[1]].char]);
                markSelected(tile[0], tile[1]);
            });
        }

        //rectangle select
        else if (rectSelecting) {
            selectedTiles.forEach(function (tile) {
                markSelected(tile[0], tile[1], true);
            });
            selectedTiles = [];
            let tiles = getTilesInRectangle(initialTile, [row, col]);
            tiles.forEach(function (tile) {
                selectedTiles.push([tile[0], tile[1]]);
                markSelected(tile[0], tile[1]);
            });
        }
    });
}

function killRadios(radio) {
    radio.addEventListener('click', function () {
        if (this === lastChecked) {
            this.checked = false;
            lastChecked = null;
        } else {
            lastChecked = this;
        }
    });
}

function markSelected(row, col, unmark = false) {
    let tile = mapCode[row][col].upper;
    if (gamemode === 'Brawl Ball') {
        if ((row === 0 || row === 29) && (col === 0 || col === 14))
            return;
    }
    if (!unmark) {
        tile.style.backgroundColor = eraser ? '#FF000050' : '#F7F7F780';
        if (multiDragging || areaSelecting) tile.style.backgroundColor = '#47F74760';
        if (pasting) tile.style.backgroundColor = '#00000000';
        tile.style.opacity = '1';
        if (!multiDraggingClicking && !dragging) {
            tile.style.width = `${tileWidthPercent}%`;
            tile.style.height = `${tileHeightPercent}%`;
        }
    }
    else {
        tile.style.opacity = '0';
        tile.style.backgroundColor = '#00000000';
        tile.src = './Resources/Transparent.png?v=1';
        tile.style.transform = 'translate(0, 0)';
    }
}

function getTilesInRectangle(startTile, endTile) {

    const minRow = Math.min(startTile[0], endTile[0]);
    const maxRow = Math.max(startTile[0], endTile[0]);
    const minCol = Math.min(startTile[1], endTile[1]);
    const maxCol = Math.max(startTile[1], endTile[1]);

    const tilesInRectangle = [];
    for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {;
            tilesInRectangle.push([row, col]);
        }
    }
    return tilesInRectangle;
}

function replaceTiles() {
    for (let i = 0; i < mapCode.length; i++) {
        for (let j = 0; j < mapCode[0].length; j++) {
            if (mapCode[i][j].char === replaceFrom) {
                mapCode[i][j].char = replaceTo;
            }
        }
    }

    makeMapFromCode();

    document.getElementById('replacer').checked = false;
}

function setReplacer() {
    if (replacer && replaceFrom && replaceTo) {
        replaceTiles();
    }
    else if (replacer && replaceFrom) {
        replaceTo = '.';
        replaceTiles();
    }

    replacer = !replacer;
    replaceFrom = null;
    replaceTo = null;
    if (!replacer) document.querySelectorAll('.tile-display').forEach(function (display) {
        display.classList.remove('tile-display-replace-from');
        display.classList.remove('tile-display-replace-to');
        document.getElementById('replacerText').style.display = 'none';
    });
    else {
        document.getElementById('replacerText').style.display = 'block';
    }
}

function clearMap() {
    if (confirm('Are you sure you want to remove all tiles from this map?')) {
        actionsStack = [];
        undoneActionsStack = [];
        generateMap();
    }
}

function chooseTile(object, tile, event = null) {
    if (event) event.preventDefault();
    if (object instanceof HTMLInputElement) {
        document.querySelectorAll('.tile-display').forEach(function (tileDisplay) {
            tileDisplay.classList.remove('tile-display-selected');
        });
        object.classList.add('tile-display-selected');
    }

    tileSelected = tile;
}

function generateMap(s = size) {
    document.getElementById('PanelBackground').innerHTML = '';
    document.getElementById('PanelButtons').innerHTML = '';
    document.getElementById('PanelTiles').innerHTML = '';
    document.getElementById('PanelUppers').innerHTML = '';


    columns = parseInt(s.substring(0, s.indexOf('×')));
    rows = parseInt(s.substring(s.indexOf('×') + 1, s.indexOf(' ')));

    mapCode = Array.from({ length: rows }, () => new Array(columns));

    tileWidthPercent = parseFloat((100.0 / parseFloat(columns)).toFixed(3));
    tileHeightPercent = parseFloat((100.0 / parseFloat(rows)).toFixed(3));

    zoom(0);
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            let tileID = row.toString() + ',' + col.toString();
            let leftPosition = (col * tileWidthPercent).toFixed(3);
            let topPosition = (row * tileHeightPercent).toFixed(3);

            let button = document.createElement('div');
            button.id = 'button' + tileID;
            button.style.width = tileWidthPercent + '%';
            button.style.height = tileHeightPercent + '%';
            button.className = 'map-tile-button';
            button.style.left = leftPosition + '%';
            button.style.top = topPosition + '%';
            button.style.zIndex = '31';

            mapCode[row][col] = new Tile(row, col, button);

            mapCode[row][col].button.onclick = buttonListening(row, col);

            let img = document.createElement('img');
            img.id = tileID;
            img.className = 'map-tile-image';
            img.style.width = tileWidthPercent + '%';
            img.style.height = tileHeightPercent + '%';
            img.alt = '';
            img.style.left = leftPosition + '%';
            img.style.top = topPosition + '%';
            img.style.zIndex = '11';

            let back = document.createElement('img');
            back.id = 'back' + tileID;
            back.className = 'map-tile-back';
            back.style.width = tileWidthPercent + '%';
            back.style.height = tileHeightPercent + '%';
            back.alt = '';
            back.src = ((row * columns + col) % 2 === 1 && columns % 2 === 1 || (row + col) % 2 === 0 && columns % 2 === 0) ? path + '/BGLight.png?v=1' : path + '/BGDark.png?v=1';
            back.style.left = leftPosition + '%';
            back.style.top = topPosition + '%';
            back.style.zIndex = '6';

            mapCode[row][col].image = img;

            let upper = document.createElement('img');
            upper.id = 'upper' + tileID;
            upper.style.borderRadius = '0';
            upper.className = 'map-tile-upper';
            upper.style.width = tileWidthPercent + '%';
            upper.style.height = tileHeightPercent + '%';
            upper.alt = '';
            upper.src = './Resources/Transparent.png?v=1';
            upper.style.border = 'none';
            upper.style.left = leftPosition + '%';
            upper.style.top = topPosition + '%';
            upper.style.zIndex = '21';

            mapCode[row][col].upper = upper;

            document.getElementById('PanelButtons').appendChild(button);
            document.getElementById('PanelTiles').appendChild(img);
            document.getElementById('PanelUppers').appendChild(upper);
            document.getElementById('PanelBackground').appendChild(back);
        }
    }
}

function getImage(tile = tileSelected, blue = true) {
    let image;
    let x = tile;
    switch (x) {
        case '.':
            image = "";
            break;
        case 'M':
            image = path + '/Tiles/Wall.png?v=1';
            break;
        case 'X':
            image = path + '/Tiles/Wall2.png?v=1';
            break;
        case 'Y':
            image = path + '/Tiles/Crate.png?v=1';
            break;
        case 'C':
            image = path + '/Tiles/Barrel.png?v=1';
            break;
        case 'F':
            image = path + '/Tiles/Bush.png?v=1';
            break;
        case 'T':
            image = path + '/Tiles/Cactus.png?v=1';
            break;
        case 'B':
            image = path + '/Tiles/Skull.png?v=1';
            break;
        case 'N':
            if (regularFenceEnvs.indexOf(theme) !== -1 || almostRegularFenceEnvs.indexOf(theme) !== -1) image = path + '/Fence/Fence.png?v=1';
            else if (chainFenceEnvs.indexOf(theme) !== -1) image = path + '/Fence/0110.png?v=1';
            break;
        case 'W':
            image = path + '/Water/00000000.png?v=1';
            break;
        case '1':
            if (gamemode !== 'Showdown') image = './Resources/Global/Spawns/3V3/1.png?v=1';
            else image = './Resources/Global/Spawns/Sd/1.png?v=1';
            break;
        case '2':
            if (gamemode !== 'Showdown') image = './Resources/Global/Spawns/3V3/2.png?v=1';
            else image = './Resources/Global/Spawns/Sd/2.png?v=1';
            break;
        case '8':
            if (gamemode === 'Siege') {
                if (blue) image = './Resources/Global/Objectives/IkeBlue.png?v=1';
                else image = './Resources/Global/Objectives/IkeRed.png?v=1';
                break;
            }
            if (gamemode === 'Snowtel Thieves') {
                if (blue) image = './Resources/Global/Objectives/SnowtelThievesBlue.png?v=1';
                else image = './Resources/Global/Objectives/SnowtelThievesRed.png?v=1';
                break;
            }
            else if (gamemode !== 'Gem Grab' && gamemode !== 'Brawl Ball' && gamemode !== 'Heist' && gamemode !== 'Showdown') {
                image = './Resources/Global/Objectives/' + gamemode.replace(/ /g, '_') + '.png?v=1';
                break;
            }
            else if (gamemode !== 'Showdown') {
                image = path + '/Gamemode_Specifics/' + gamemode.replace(/ /g, '_') + '.png?v=1';
                break;
            }
        case '4':
            image = './Resources/Global/Objectives/Box.png?v=1';
            break;
        case 'g':
            image = './Resources/Global/Objectives/Bolt.png?v=1';
            break;
        case 'H':
            image = './Resources/Global/Jps/JumppadRight.png?v=1';
            break;
        case 'G':
            image = './Resources/Global/Jps/JumppadLeft.png?v=1';
            break;
        case 'L':
            image = './Resources/Global/Jps/JumppadBottom.png?v=1';
            break;
        case 'K':
            image = './Resources/Global/Jps/JumppadTop.png?v=1';
            break;
        case 'P':
            image = './Resources/Global/Jps/JumppadBottomRight.png?v=1';
            break;
        case 'Z':
            image = './Resources/Global/Jps/JumppadTopLeft.png?v=1';
            break;
        case 'O':
            image = './Resources/Global/Jps/JumppadBottomLeft.png?v=1';
            break;
        case 'U':
            image = './Resources/Global/Jps/JumppadTopRight.png?v=1';
            break;
        case 'c':
            image = './Resources/Global/Tps/BlueTeleporter.png?v=1';
            break;
        case 'd':
            image = './Resources/Global/Tps/GreenTeleporter.png?v=1';
            break;
        case 'e':
            image = './Resources/Global/Tps/RedTeleporter.png?v=1';
            break;
        case 'f':
            image = './Resources/Global/Tps/YellowTeleporter.png?v=1';
            break;
        case 'a':
            //Rope Fence
            image = path + '/Rope/Rope.png?v=1';
            break;
        case 'v':
            image = './Resources/Global/Special_Tiles/Spikes.png?v=1';
            break;
        case 'x':
            image = './Resources/Global/Special_Tiles/Smoke.png?v=1';
            break;
        case 'y':
            image = './Resources/Global/Special_Tiles/HealPad.png?v=1';
            break;
        case 'z':
            image = './Resources/Global/Special_Tiles/SlowTile.png?v=1';
            break;
        case 'w':
            image = './Resources/Global/Special_Tiles/SpeedTile.png?v=1';
            break;
        case 'I':
            image = './Resources/Global/Unbreakable.png?v=1';
            break;
    }
    return image;
}

function selectGamemode(mode) {
    if (gamemode === 'Brawl Ball') allQuarters(false);
    document.getElementById('specialTile').value = '8';
    replaceFrom = '4';
    replaceTo = '8';
    replaceTiles();

    gamemode = mode;
    if (gamemode === 'Brawl Ball' && size === '21×33 (Regular)') {
        allQuarters(true);
    }

    document.getElementById('specialTile').style.display = 'inline-block';

    if (gamemode === 'Showdown') {
        document.getElementById('specialTile').src = getImage('4');
        document.getElementById('specialTile').value ='4';
        document.getElementById('spawn1').src = './Resources/Global/Spawns/Sd/1.png?v=1';
        document.getElementById('spawn2').src = './Resources/Global/Spawns/Sd/2.png?v=1';
    }

    else {
        document.getElementById('spawn1').src = './Resources/Global/Spawns/3V3/1.png?v=1';
        document.getElementById('spawn2').src = './Resources/Global/Spawns/3V3/2.png?v=1';
    }

    if (gamemode !== 'Wipeout' && gamemode !== 'Knockout' && gamemode !== 'Duels' && gamemode !== 'Showdown' && gamemode !== 'Siege') {
        document.getElementById('specialTile').src = getImage('8');
    }

    else if (gamemode === 'Snowtel Thieves' || gamemode === 'Siege') document.getElementById('specialTile').src = getImage('8', gamemode === 'Snowtel Thieves');

    else if (gamemode === 'Showdown') {
        replaceFrom = '8';
        replaceTo = '4';
        replaceTiles();
    }

    else {
        replaceFrom = '8';
        replaceTo = '.';
        replaceTiles();
        document.getElementById('specialTile').style.display = 'none';
    }

    if (gamemode === 'Siege') {
        document.getElementById('siegeDisplay').style.display = 'block';
        document.getElementById('boltDisplay').style.display = 'inline-block';
        document.getElementById('basketDisplay').style.display = 'none';
        document.getElementById('baskets').style.display = 'none';
    }
    else if (gamemode === 'Basket Brawl') {
        replaceFrom = 'g';
        replacTo = '.';
        replaceTiles();
        document.getElementById('basketDisplay').style.display = 'block';
        document.getElementById('baskets').style.display = 'block';
        document.getElementById('siegeDisplay').style.display = 'none';
        document.getElementById('boltDisplay').style.display = 'none';
    }
    else {
        replaceFrom = 'g';
        replacTo = '.';
        replaceTiles();
        document.getElementById('siegeDisplay').style.display = 'none';
        document.getElementById('boltDisplay').style.display = 'none';
        document.getElementById('basketDisplay').style.display = 'none';
        document.getElementById('baskets').style.display = 'none';
    }

    document.getElementById('modeDisplay').innerText = gamemode;

    if ((gamemode === 'Gem Grab' || gamemode === 'Brawl Ball' || gamemode === 'Basket Brawl' || gamemode === 'Bounty' || gamemode === 'Hold The Trophy' || gamemode === 'Volley Brawl') && rows === 33 && columns === 21) placeTile(16, 10, '8', false, false, false, false, false);

    else if (gamemode === 'Hot Zone' && count('8') === 0 && rows === 33 && columns === 21) placeTile(16, 10, '8', false, false, false, false, false);

    else if (gamemode === 'Heist' && rows === 33 && columns == 21) {
        replaceFrom = '8';
        replaceTo = '.';
        replaceTiles();
        placeTile(3, 10, '8', true, false, false, false, false);
    }

    else if (gamemode === 'Snowtel Thieves' && rows === 33 && columns == 21) {
        replaceFrom = '8';
        replaceTo = '.';
        replaceTiles();
        placeTile(5, 10, '8', true, false, false, false, false);
    }

    else if (gamemode === 'Siege' && rows === 39 && columns == 27) placeTile(3, 13, '8', true, false, false, false, false);

    else if (gamemode === 'Basket Brawl' && rows === 17 && columns === 21) placeTile(8, 10, '8', false, false, false, false, false);

    else if (gamemode === 'Volley Brawl' && rows === 27 && columns === 21) placeTile(13, 10, '8', false, false, false, false, false);

    if (count('1') === 0 && count('2') === 0) {
        let spawns = [];
        if (size === '21×33 (Regular)') spawns = regularSpawns;
        else if (size === '27×39 (Siege)') spawns = siegeSpawns;
        else if (size === '21×27 (Volley Brawl)') spawns = volleySpawns;
        else if (size === '21×17 (Basket Brawl)') {
            basketSpawns.forEach(spawn => {
                placeTile(spawn, columns - 3, '2', false, false, false, false, false);
                placeTile(spawn, 2, '1', false, false, false, false, false);
            });
        }
        spawns.forEach(spawn => {
            placeTile(rows - 1, spawn, '1', false, false, false, false, false);
            placeTile(0, spawn, '2', false, false, false, false, false);
        });
    }

    makeMapFromCode();
}

function count(char) {
    c = 0;
    mapCode.forEach((row) => {
        row.forEach((tile) => {
            if (tile.char === char) c++;
        });
    });
    return c;
}

function selectTheme(theme) {
    path = './Resources/' + theme.replace(/ /g, '_');

    document.getElementById('M').src = getImage('M');
    document.getElementById('X').src = getImage('X');
    document.getElementById('F').src = getImage('F');
    document.getElementById('Y').src = getImage('Y');
    document.getElementById('C').src = getImage('C');
    document.getElementById('T').src = getImage('T');
    document.getElementById('N').src = getImage('N');
    document.getElementById('W').src = getImage('W');
    document.getElementById('a').src = getImage('a');
    document.getElementById('B').src = getImage('B');
    if (gamemode === 'Gem Grab' || gamemode === 'Brawl Ball' || gamemode === 'Hot Zone' || gamemode === 'Heist')
        document.getElementById('specialTile').src = getImage('8');
    document.getElementById('PanelBackground').innerHTML = '';


    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            let tileID = row.toString() + ',' + col.toString();
            let leftPosition = (col * tileWidthPercent).toFixed(3);
            let topPosition = (row * tileHeightPercent).toFixed(3);

            let back = document.createElement('img');
            back.id = 'back' + tileID;
            back.className = 'map-tile-back';
            back.style.width = tileWidthPercent + '%';
            back.style.height = tileHeightPercent + '%';
            back.alt = '';
            back.src = ((row * columns + col) % 2 === 1 && columns % 2 === 1 || (row + col) % 2 === 0 && columns % 2 === 0) ? path + '/BGLight.png?v=1' : path + '/BGDark.png?v=1';
            back.style.left = leftPosition + '%';
            back.style.top = topPosition + '%';
            back.style.zIndex = 5;

            document.getElementById('PanelBackground').appendChild(back);
        }
    }

    makeMapFromCode();
}

function setSelect(selected) {
    areaSelecting = false;
    select = selected;
}

function setEraser() {
    eraser = !eraser;
}

function setMirror(mirror) {
    mirroring[mirror] = !mirroring[mirror];
    let icon = '';
    icon += mirroring[1] ? 1 : 0;
    icon += mirroring[0] ? 1 : 0;
    icon += mirroring[2] ? 1 : 0;

    document.getElementById('mirrorIcon').src = './Resources/Additional/Icons/' + icon + '.png?v=1';

    let c = 0;
    let text = 'None';
    mirroring.forEach(m => { if (m) c++ });

    switch (c) {
        case 3:
            if (size !== '60×60 (Showdown)') {
                text = 'All';
                break;
            }
        case 1:
        case 2:
            text = '(';
            if (mirroring[0]) text += 'D ';
            if (mirroring[1]) text += 'V ';
            if (mirroring[2]) text += 'H ';
            if (mirroring[3]) text += 'T ';
            text = text.substring(0, text.length - 1);
            text += ')';
            break;
        case 4:
            text = 'All';
        default:
            break;
    }
    document.getElementById('mirrorDisplay').innerText = text;
}

function showGuides() {
    document.getElementById('guidesDisplay').style.display = document.getElementById('guider').checked ? 'block' : 'none';
    cleanUppers();
    if (document.getElementById('guider').checked) showJpsLanding();
    if (document.getElementById('errorer').checked) showErrors();
}

function isBlock(row, col) {
    if (row >= rows || row < 0 || col >= columns || col < 0) return true;
    return blocks.includes(mapCode[row][col].char);
}

function showErrors() {
    mapCode.forEach(row => {
        row.forEach(tile => {
            if (!blocks.includes(tile.char)) {
                let row = tile.row, col = tile.col;
                let node = new Node(isBlock(row - 1, col - 1));
                node.next = new Node(isBlock(row - 1, col));
                node.next.next = new Node(isBlock(row - 1, col + 1));
                node.next.next.next = new Node(isBlock(row, col + 1));
                node.next.next.next.next = new Node(isBlock(row + 1, col + 1));
                node.next.next.next.next.next = new Node(isBlock(row + 1, col));
                node.next.next.next.next.next.next = new Node(isBlock(row + 1, col - 1));
                node.next.next.next.next.next.next.next = new Node(isBlock(row, col - 1));
                node.next.next.next.next.next.next.next.next = node;

                let a = 0;
                let blocks = 0;

                for (let i = 0; i < 7; i++) { // Make sure to start the checking in a spot that is not in a middle of a line of blocks to not count that line as disconnected even if it's not.
                    if (node.bool !== node.next.bool) {
                        node = node.next;
                        break;
                    }
                    node = node.next;
                };

                for (let i = 0; i < 7; i++) { // Increase a for every change in the line of tiles around.
                    if (node.bool !== node.next.bool) {
                        a++;
                    }
                    if (node.next.bool) {
                        blocks++;
                    }
                    node = node.next;
                }
                if (a === 0 && node.bool || a >= 2 || a === 1 && blocks > 5) { // Marks the tile if there is a disconnection or if the tile is fuly surrounded
                    tile.upper.style.backgroundColor = '#FF000080';
                    tile.upper.style.opacity = '1';
                }
                if (a === 1 && blocks === 5 && (isBlock(row - 1, col) && isBlock(row + 1, col) || isBlock(row, col - 1) && isBlock(row, col + 1))) { //special case
                    tile.upper.style.backgroundColor = '#FF000080';
                    tile.upper.style.opacity = '1';
                }
            }
        });
    });
}

function showJpsLanding() {
    mapCode.forEach((row) => {
        row.forEach(t => {
            if (jumpChars.some(c => c === t.char)) {
                let diagonal;
                let c, r, ro, co;
                if (t.char === 'G') { c = -1; r = 0; diagonal = false; }
                if (t.char === 'H') { c = 1; r = 0; diagonal = false; }
                if (t.char === 'L') { c = 0; r = 1; diagonal = false; }
                if (t.char === 'K') { c = 0; r = -1; diagonal = false; }
                if (t.char === 'Z') { c = -1; r = -1; diagonal = true; ro = 0; co = 0; }
                if (t.char === 'U') { c = 1; r = -1; diagonal = true; ro = 0; co = 1; }
                if (t.char === 'P') { c = 1; r = 1; diagonal = true; ro = 1; co = 1; }
                if (t.char === 'O') { c = -1; r = 1; diagonal = true; ro = 1; co = 0; }

                if (diagonal) {
                    let x = t.row + 8 * r; 
                    let y = t.col + 8 * c;
                    if (x >= rows) x = rows - 2;
                    if (x < 0) x = 0;
                    if (y >= columns) y = columns - 2;
                    if (y < 0) y = 0;
                    let mark = mapCode[x][y].upper;
                    mark.src = './Resources/Global/JpsLandingMark.png?v=1';
                    mark.style.width = `${tileWidthPercent * 2}%`;
                    mark.style.height = 'auto';
                    mark.style.opacity = '0.65';
                    if (get2x2(x, y, 1).every(a => mapCode[a[0]][a[1]].char === '.')) mark.style.opacity = '1';
                }
                else {
                    let x = t.row + 12 * r;
                    let y = t.col + 12 * c;
                    if (x >= rows) x = rows - 2;
                    if (x < 0) x = 0;
                    if (y >= columns) y = columns - 2;
                    if (y < 0) y = 0;
                    let mark = mapCode[x][y].upper;
                    mark.src = './Resources/Global/JpsLandingMark.png?v=1';
                    mark.style.width = `${tileWidthPercent * 2}%`;
                    mark.style.height = 'auto';
                    mark.style.opacity = '0.65';
                    if (get2x2(x, y, 1).every(a => mapCode[a[0]][a[1]].char === '.')) mark.style.opacity = '1';
                }
            }
        });
    });
}

function makeQuarterGone(row, col, gone) {
    if (gone) {
        mapCode[row][col].upper.style.backgroundColor = '#201A4E';
        mapCode[row][col].upper.style.opacity = '1';
        mapCode[row][col].upper.style.width = '33.33333333333333333333333333%';
        mapCode[row][col].upper.style.height = '12.12121212121212121212121212%';
        mapCode[row][col].upper.style.zIndex = '7';
        for (let i = row; i < row + 4; i++) {
            for (let j = col; j < col + 7; j++) {
                mapCode[i][j].char = 'J';
                brawlBallTiles.push([i, j]);
            }
        }
    } else {
        mapCode[row][col].upper.src = './Resources/Transparent.png?v=1';
        mapCode[row][col].upper.style.opacity = '0';
        mapCode[row][col].upper.style.zIndex = '20';
        for (let i = row; i < row + 4; i++) {
            for (let j = col; j < col + 7; j++) {
                placeTile(i, j, '.');
            }
        }
    }
}

function allQuarters(gone) {
    brawlBallTiles = [];
    makeQuarterGone(0, 0, gone);
    makeQuarterGone(0, columns - 7, gone);
    makeQuarterGone(rows - 4, 0, gone);
    makeQuarterGone(rows - 4, columns - 7, gone);
}

function makeMapFromCode() {

    let code = mapCode.map(row => row.map(tile => tile.char));
    generateMap();
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
            if (code[i][j].char !== '.')
                placeTile(i, j, code[i][j], false, false, false, false);
        }
    }

    if (gamemode === 'Brawl Ball' && size === '21×33 (Regular)') {
        allQuarters(true);
    }

    if (errorer) {
        mapCode.forEach(function (row) {
            row.forEach(function (tile) {
                markSelected(tile.row, tile.col, true);
            });
        });
        showErrors();
    }
}

function undo() {
    if (actionsStack.length === 0) return;
    undoneActionsStack.push(mapCode.map(row => row.map(tile => tile.duplicate())));
    mapCode = actionsStack.pop();

    makeMapFromCode();
}

function redo() {
    if (undoneActionsStack.length === 0) return;
    actionsStack.push(mapCode.map(row => row.map(tile => tile.duplicate())));
    mapCode = undoneActionsStack.pop();

    makeMapFromCode();
}

function placeTile(row, col, tile = tileSelected, d = mirroring[0], v = mirroring[1], h = mirroring[2], e = eraser, upper = false) {
	//Proof Checks
	if (brawlBallTiles.some(bbTile => bbTile[0] === row && bbTile[1] === col)) return;
	if (tile === '' && !e) return;
	if (row >= rows || row < 0) return;
	if (col >= columns || col < 0) return;
    if (tile === '8' && gamemode === 'Showdown') tile = '4';

	//Arrangement Check
	let arranged = false;
	if (!upper && (arrangedTiles.indexOf(mapCode[row][col].char) !== -1 && mapCode[row][col].char !== tile || arrangedTiles.indexOf(tile) !== -1 || mapCode[row][col].char !== tile)) arranged = true;
	
	//Redirects
	if (fourChars.indexOf(tile) !== -1) {
		place2x2(row, col, tile, d, v, h, e, upper);
		if (arranged) arrangeAll(row, col, d, v, h);
		return;
	}
	if (jumpChars.indexOf(tile) !== -1) {
		placeJumppad(row, col, tile, d, v, h, e, upper);
		if (arranged) arrangeAll(row, col, d, v, h);
		return;
	}
	
	let image = getImage(tile);
	
	//Mirroring
	let tiles = [[row, col]];
    if (!mirroringBlocked) {
        if (d) tiles.push([rows - 1 - row, columns - 1 - col]);
        if (v) tiles.push([rows - 1 - row, col]);
        if (h) tiles.push([row, columns - 1 - col]);
    }
	
	//2x2 Proof Checking
	if (tile !== '.') {
		tiles.forEach(function (a) {
			get2x2(a[0], a[1], -1).forEach(b => {
				if (b[0] !== a[0] || b[1] !== a[1]) if (fourChars.includes(mapCode[b[0]][b[1]].char) || jumpChars.includes(mapCode[b[0]][b[1]].char)) {
					let x = upper ? mapCode[b[0]][b[1]].upper : mapCode[b[0]][b[1]].image;
					x.src = './Resources/Transparent.png?v=1';
					if (!upper) mapCode[b[0]][b[1]].char = '.';
					x.opacity = '0';
				}
			});
		});
	}
	
	//Placing
	tiles.forEach(function (a) {
		let spot = mapCode[a[0]][a[1]];
		let affectedSpot = upper ? spot.upper : spot.image;
		
		if (e || tile === '.'){
			affectedSpot.src = './Resources/Transparent.png?v=1';
			if (!upper) spot.char = '.';
			affectedSpot.opacity = '0';
		}
		
		else {
			if (gamemode === 'Siege' || gamemode === 'Snowtel Thieves') image = getImage(tile, a[0] * columns + a[1] > rows * columns / 2);
			affectedSpot.src = image;
			affectedSpot.style.opacity = '1';
			affectedSpot.style.height = 'auto';
			affectedSpot.style.width = `${tileWidthPercent * tileSizes[tile][0]}%`;
            affectedSpot.style.transform = `translate(${tileSizes[tile][2]}%, ${tileSizes[tile][3]}%)`;
			if (!upper) spot.char = tile;
            if (!upper) affectedSpot.style.zIndex = '10';
            if (tileSizes[tile].length > 4 && !upper) affectedSpot.style.zIndex = '' + tileSizes[tile][4]; 
		}
    });

    if (tile === '8' && !e) {
        placeSpecial(tiles, upper);
    }
    if (tile === 'B' && largeSkulls.indexOf(theme) !== -1 && !e) {
        placeSmaller(tiles, upper);
    }
	
	if (arranged) arrangeAll(row, col, d, v ,h);
}

function placeSmaller(tiles, upper) {
    tiles.forEach(function (tile) {
        let imageDisplay = upper ? mapCode[tile[0]][tile[1]].upper : mapCode[tile[0]][tile[1]].image;
        imageDisplay.style.height = `${tileHeightPercent * 1.6}%`;
        imageDisplay.style.transform = 'translate(0%, -25%)';
    });
}

function placeSpecial(tiles, upper) {
    tiles.forEach(function (tile) {
        let imageDisplay = upper ? mapCode[tile[0]][tile[1]].upper : mapCode[tile[0]][tile[1]].image;

        switch (gamemode) {
            case 'Snowtel Thieves':
                imageDisplay.style.width = `${(tileWidthPercent * 7).toFixed(3)}%`;
                imageDisplay.style.transform = 'translate(-42%, -42%)';
                imageDisplay.style.opacity = '0.6';
                if (!upper) imageDisplay.style.zIndex = '9';
                break;
            case 'Hot Zone':
                imageDisplay.style.width = `${(tileWidthPercent * 7).toFixed(3)}%`;
                imageDisplay.style.transform = 'translate(-42%, -42%)';
                if (!upper) imageDisplay.style.zIndex = '18';
                break;
            case 'Hold The Trophy':
                imageDisplay.style.width = `${(tileWidthPercent * 2.5).toFixed(3)}%`;
                imageDisplay.style.transform = 'translate(-30%, -28%)';
                if (!upper) imageDisplay.style.zIndex = '13';
                break;
            case 'Heist':
                imageDisplay.style.width = `${(tileWidthPercent * 2).toFixed(3)}%`;
                imageDisplay.style.transform = 'translate(-20%, -55%)';
                if (!upper) imageDisplay.style.zIndex = '13';
                break;
            case 'Gem Grab':
                if (normalMines.indexOf(theme) !== -1) {
                    imageDisplay.style.width = `${(tileWidthPercent * 2).toFixed(3)}%`;
                    imageDisplay.style.transform = 'translate(-22.5%, -22.5%)';
                }
                else if (cityMines.indexOf(theme) !== -1) {
                    imageDisplay.style.width = `${(tileWidthPercent * 2.2).toFixed(3)}%`;
                    imageDisplay.style.transform = 'translate(-22.5%, -22.5%)';
                }
                
                if (!upper) imageDisplay.style.zIndex = '13';
                break;
            case 'Bounty':
                imageDisplay.style.width = `${(tileWidthPercent * 1.15).toFixed(3)}%`;
                imageDisplay.style.transform = 'translate(-5.5%, -25%)';
                if (!upper) imageDisplay.style.zIndex = '13';
                break;
            case 'Basket Brawl':
            case 'Volley Brawl':
            case 'Brawl Ball':
                imageDisplay.style.width = `${(tileWidthPercent * 1.3).toFixed(3)}%`;
                imageDisplay.style.transform = 'translate(-11%, -16.5%)';
                if (!upper) imageDisplay.style.zIndex = '13';
                break;
            case 'Siege':
                imageDisplay.style.width = `${(tileWidthPercent * 2).toFixed(3)}%`;
                imageDisplay.style.transform = 'translate(-20%, -55%)';
                if (!upper) imageDisplay.style.zIndex = '13';
                break;
        }
    });
}

function place2x2(row, col, tile = tileSelected, d = mirroring[0], v = mirroring[1], h = mirroring[2], e = eraser, upper = false) {
    //Proof Checks
    if (brawlBallTiles.some(bbTile => bbTile[0] === row && bbTile[1] === col)) return;
    if (row === rows - 1 || col === columns - 1) return;
    if (tile === '' && !e) return;
    if (row >= rows || row < 0) return;
    if (col >= columns || col < 0) return;
    let tiles = [[row, col]];

    let image = getImage(tile);

    if (!mirroringBlocked) {
        if (d) tiles.push([rows - 2 - row, columns - 2 - col]);
        if (v) tiles.push([rows - 2 - row, col]);
        if (h) tiles.push([row, columns - 2 - col]);
    }

    tiles.forEach(function (a) {
        let stop = false;
        get2x2(a[0], a[1], 1).forEach(b => {
            get2x2(b[0], b[1], -1).forEach(d => {
                if (d[0] !== a[0] || d[1] !== a[1]) if (fourChars.includes(mapCode[d[0]][d[1]].char) || jumpChars.includes(mapCode[d[0]][d[1]].char)) {
                    if (alreadyPlaced.some(p => p[0] === d[0] && p[1] === d[1])) {
                        stop = true; return;
                    }
                    let x = upper ? mapCode[d[0]][d[1]].upper : mapCode[d[0]][d[1]].image;
                    x.src = './Resources/Transparent.png?v=1';
                    if (!upper) mapCode[d[0]][d[1]].char = '.';
                    x.opacity = '0';
                }
            });
        });

        let spot = mapCode[a[0]][a[1]];
        let x = upper ? spot.upper : spot.image;
        if (e) {
            x.src = './Resources/Transparent.png?v=1';
            if (!upper) spot.char = '.';
            x.style.opacity = '0';
        }
        else {
            get2x2(a[0], a[1], 1).forEach(t => {
                if (alreadyPlaced.some(p => p[0] === t[0] && p[1] === t[1])) {
                    stop = true; return;
                }
                let y = upper ? mapCode[t[0]][t[1]].upper : mapCode[t[0]][t[1]].image;
                y.src = './Resources/Transparent.png?v=1';
                if (!upper) mapCode[t[0]][t[1]].char = '.';
                y.opacity = '0';
            });
            if (stop) return;
            x.src = image;
            x.style.opacity = '1';
            x.style.height = 'auto';
            x.style.width = `${100.0 / columns * 2}%`;
            x.style.transform = 'translateY(0%)';
            if (!upper) spot.char = tile;
            if (!upper) x.style.zIndex = '10';
            if (rectSelecting || lineSelecting) alreadyPlaced.push([a[0], a[1]]);
        }
    });
}

function get2x2(row, col, int) {
    arr = [[row, col]];
    if (int < 0) {
        if (row !== 0) {
            arr.push([row + int, col]);
            if (col !== 0)
                arr.push([row + int, col + int])
        }
        if (col !== 0)
            arr.push([row, col + int]);
    }
    else {
        if (row !== rows) {
            arr.push([row + int, col]);
            if (col !== columns)
                arr.push([row + int, col + int])
        }
        if (col !== columns)
            arr.push([row, col + int]);
    }
    
    return arr;
}

function placeJumppad(row, col, tile = tileSelected, d = mirroring[0], v = mirroring[1], h = mirroring[2], e = eraser, upper = false) {
    place2x2(row, col, tile, false, false, false, e, upper);

    if (d) {
        switch (tile) {
            case 'H':
                place2x2(rows - 2 - row, columns - 2 - col, 'G', false, false, false, e, upper);
                break;
            case 'G':
                place2x2(rows - 2 - row, columns - 2 - col, 'H', false, false, false, e, upper);
                break;
            case 'L':
                place2x2(rows - 2 - row, columns - 2 - col, 'K', false, false, false, e, upper);
                break;
            case 'K':
                place2x2(rows - 2 - row, columns - 2 - col, 'L', false, false, false, e, upper);
                break;
            case 'P':
                place2x2(rows - 2 - row, columns - 2 - col, 'Z', false, false, false, e, upper);
                break;
            case 'Z':
                place2x2(rows - 2 - row, columns - 2 - col, 'P', false, false, false, e, upper);
                break;
            case 'O':
                place2x2(rows - 2 - row, columns - 2 - col, 'U', false, false, false, e, upper);
                break;
            case 'U':
                place2x2(rows - 2 - row, columns - 2 - col, 'O', false, false, false, e, upper);
                break;
            default:
                place2x2(rows - 2 - row, columns - 2 - col, undefined, false, false, false, e, upper);
        }
    }

    if (v) {
        switch (tile) {
            case 'H':
                place2x2(rows - 2 - row, col, 'H', false, false, false, e, upper);
                break;
            case 'G':
                place2x2(rows - 2 - row, col, 'G', false, false, false, e, upper);
                break;
            case 'L':
                place2x2(rows - 2 - row, col, 'K', false, false, false, e, upper);
                break;
            case 'K':
                place2x2(rows - 2 - row, col, 'L', false, false, false, e, upper);
                break;
            case 'P':
                place2x2(rows - 2 - row, col, 'U', false, false, false, e, upper);
                break;
            case 'Z':
                place2x2(rows - 2 - row, col, 'O', false, false, false, e, upper);
                break;
            case 'O':
                place2x2(rows - 2 - row, col, 'Z', false, false, false, e, upper);
                break;
            case 'U':
                place2x2(rows - 2 - row, col, 'P', false, false, false, e, upper);
                break;
            default:
                place2x2(rows - 2 - row, columns - 2 - col, undefined, false, false, false, e, upper);
        }
    }

    if (h) {
        switch (tile) {
            case 'H':
                place2x2(row, columns - 2 - col, 'G', false, false, false, e, upper);
                break;
            case 'G':
                place2x2(row, columns - 2 - col, 'H', false, false, false, e, upper);
                break;
            case 'L':
                place2x2(row, columns - 2 - col, 'L', false, false, false, e, upper);
                break;
            case 'K':
                place2x2(row, columns - 2 - col, 'K', false, false, false, e, upper);
                break;
            case 'P':
                place2x2(row, columns - 2 - col, 'O', false, false, false, e, upper);
                break;
            case 'Z':
                place2x2(row, columns - 2 - col, 'U', false, false, false, e, upper);
                break;
            case 'O':
                place2x2(row, columns - 2 - col, 'P', false, false, false, e, upper);
                break;
            case 'U':
                place2x2(row, columns - 2 - col, 'Z', false, false, false, e, upper);
                break;
            default:
                place2x2(rows - 2 - row, columns - 2 - col, undefined, false, false, false, e, upper);
        }
    }
}

function saveVersion() {
    if (sameVersion(mapCode, savedVersions[savedVersions.length - 1])) return;
    
    savedVersions.push(mapCode.map(row => row.map(tile => tile.duplicate())));
    document.getElementById('versionNumber').value = savedVersions.length
}

function changeVersion(version) {
    if (version > savedVersions.length) { 
        document.getElementById('versionNumber').value = savedVersions.length !== 0 ? savedVersions.length : 1; 
        return; 
    }
    mapCode = savedVersions[version - 1];
    makeMapFromCode();
}

function arrangeAll(row, col, d = mirroring[0], v = mirroring[1], h = mirroring[2]) {
    let tiles = [[row, col]];
    if (d) tiles.push([rows - 1 - row, columns - 1 - col]);
    if (v) tiles.push([rows - 1 - row, col]);
    if (h) tiles.push([row, columns - 1 - col]);
    tiles.forEach(function (tile) {
        arrangeFences(tile[0], tile[1]);
        arrangeWaters(tile[0], tile[1]);
        arrangeRopes(tile[0], tile[1]);
    });
}

function getTotalPositions(tile) {
    let positions = [];

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            if (mapCode[row][col].char === tile) {
                positions.push([row, col]);
            }
        }
    }
    return positions;
}

function arrangeFences(row, col) {
    let type;
    let fences;
    let fencesToArrange;
    if (regularFenceEnvs.indexOf(theme) !== -1 || almostRegularFenceEnvs.indexOf(theme) !== -1) type = 0;
    else if (chainFenceEnvs.indexOf(theme) !== -1) type = 1;
    switch (type) {
        case 0: // regular
            fences = getTotalPositions('N');
            fencesToArrange = [[row, col], [row + 1, col], [row - 1, col], [row, col + 1], [row, col - 1]];
            fencesToArrange = fencesToArrange.filter(fence => fences.some(f => f[0] === fence[0] && f[1] === fence[1]));

            fencesToArrange.forEach(function (fence) {
                let r = fence[0], c = fence[1];
                let spot = mapCode[r][c];

                let image = path + '/Fence/Fence.png?v=1';
                spot.image.style.transform = 'translate(0, -30%)';

                if (fences.some(f => f[0] === r && f[1] === c - 1) && fences.some(f => f[0] === r && f[1] === c + 1)) {
                    image = path + '/Fence/FenceSide.png?v=1';
                    spot.image.style.transform = 'translate(0, -5%)';
                    if (almostRegularFenceEnvs.indexOf(theme) !== -1) { spot.image.style.transform = 'translate(0, -20%)'; }
                    else if (theme === 10) { spot.image.style.transform = 'translate(0, -30%)'; }

                    if (fences.some(f => f[0] === r + 1 && f[1] === c) || fences.some(f => f[0] === r - 1 && f[1] === c)) {
                        image = path + '/Fence/Fence.png?v=1';
                        spot.image.style.transform = 'translate(0, -30%)';
                    }

                } else if (fences.some(f => f[0] === r + 1 && f[1] === c) && fences.some(f => f[0] === r - 1 && f[1] === c)) {
                    spot.image.style.transform = 'translate(0, -30%)';
                    image = path + '/Fence/FenceUp.png?v=1';

                    if (fences.some(f => f[0] === r && f[1] === c + 1) || fences.some(f => f[0] === r && f[1] === c - 1)) {
                        image = path + '/Fence/Fence.png?v=1';
                        spot.image.style.transform = 'translate(0, -30%)';
                    }
                }
                spot.image.src = image;
            });
            break;
        case 1:
            fences = getTotalPositions('N');
            fencesToArrange = [[row, col], [row + 1, col], [row - 1, col], [row, col + 1], [row, col - 1]];
            fencesToArrange = fencesToArrange.filter(fence => fences.some(f => f[0] === fence[0] && f[1] === fence[1]));

            fencesToArrange.forEach(function (fence) {
                let code = [0, 0, 0, 0];
                let r = fence[0], c = fence[1];
                let spot = mapCode[r][c];

                if (fences.some(f => f[0] === r && f[1] === c - 1)) code[1] = 1;
                if (fences.some(f => f[0] === r && f[1] === c + 1)) code[2] = 1;
                if (code.filter(num => num === 1).length === 2) { spot.image.src = path + '/Fence/' + code.join('') + '.png?v=1'; spot.image.style.transform = 'translate(0, -30%)'; return; }
                if (fences.some(f => f[0] === r - 1 && f[1] === c)) code[0] = 1;
                if (fences.some(f => f[0] === r + 1 && f[1] === c)) code[3] = 1;
                if (code.filter(num => num === 1).length === 2 || code.filter(num => num === 1).length === 1) {
                    spot.image.src = path + '/Fence/' + code.join('') + '.png?v=1';
                    spot.image.style.transform = 'translate(0, -30%)';
                    if ((code[0] === 0 || code[3] === 0) && code.filter(num => num === 1).length !== 1) { spot.image.style.transform = 'translate(0, -45%)'; }
                }
                else if (code.filter(num => num === 1).length === 0) { spot.image.src = path + '/Fence/0110.png?v=1'; }
                else { spot.image.src = path + '/Fence/1001.png?v=1'; spot.image.style.transform = 'translate(0, -30%)'; }
            });
            break;
    }
}

function arrangeWaters(row, col) {
    let waters = getTotalPositions('W');
    let watersToArrange = [
        [row - 1, col - 1], [row - 1, col], [row - 1, col + 1],
        [row, col - 1], [row, col], [row, col + 1],
        [row + 1, col - 1], [row + 1, col], [row + 1, col + 1]
    ];

    watersToArrange = watersToArrange.filter(water =>
        waters.some(w => w[0] === water[0] && w[1] === water[1])
    );

    watersToArrange.forEach(function (water) {
        let r = water[0], c = water[1];
        let code = new Array(8).fill('0');
        let top = false; bottom = false; right = false; left = false;

        if (c === columns - 1) right = true; // end right
        if (waters.some(w => w[0] === r && w[1] === c + 1) || right) code[4] = '1'; // right
        if (c === 0) left = true; // end left
        if (waters.some(w => w[0] === r && w[1] === c - 1) || left) code[3] = '1'; // left
        if (r === rows - 1) bottom = true; // end bottom
        if (waters.some(w => w[0] === r + 1 && w[1] === c) || bottom) code[6] = '1'; // bottom
        if (r === 0) top = true; // end top
        if (waters.some(w => w[0] === r - 1 && w[1] === c) || top) code[1] = '1'; // top
        if (waters.some(w => w[0] === r - 1 && w[1] === c - 1) && (code[1] === '1' || top) && (code[3] === '1' || left) || (code[1] === '1' || top) && left || top && (code[3] === '1' || left)) code[0] = '1'; // top left
        if (waters.some(w => w[0] === r - 1 && w[1] === c + 1) && (code[1] === '1' || top) && (code[4] === '1' || right) || (code[1] === '1' || top) && right || top && (code[4] === '1' || right)) code[2] = '1'; // top right
        if (waters.some(w => w[0] === r + 1 && w[1] === c - 1) && (code[3] === '1' || left) && (code[6] === '1' || bottom) || (code[6] === '1' || bottom) && left || bottom && (code[3] === '1' || left)) code[5] = '1'; // bottom left
        if (waters.some(w => w[0] === r + 1 && w[1] === c + 1) && (code[4] === '1' || right) && (code[6] === '1' || bottom) || (code[6] === '1' || bottom) && right || bottom && (code[4] === '1' || right)) code[7] = '1'; // bottom right

        mapCode[r][c].image.src = path + '/Water/' + code.join('') + '.png?v=1';
    });
}

function arrangeRopes(row, col) {
    let ropes = getTotalPositions('a');
    let ropesToArrange = [
        [row, col], [row + 1, col], [row - 1, col], [row, col + 1], [row, col - 1]
    ];

    ropesToArrange = ropesToArrange.filter(rope =>
        ropes.some(r => r[0] === rope[0] && r[1] === rope[1])
    );

    ropesToArrange.forEach(function (rope) {
        let r = rope[0], c = rope[1];
        let toRight = false;
        let toTop = false;

        if (ropes.some(ro => ro[0] === r && ro[1] === c + 1)) toRight = true;
        if (ropes.some(ro => ro[0] === r - 1 && ro[1] === c)) toTop = true;

        let spot = mapCode[r][c].image;

        if (toRight) {
            if (toTop) {
                spot.src = path + '/Rope/RopeBoth.png?v=1';
                spot.style.width = `${(tileWidthPercent * 1.485).toFixed(3)}%`;
                spot.style.transform = 'translate(0%, -55%)';
                return;
            }
            spot.src = path + '/Rope/RopeSide.png?v=1';
            spot.style.width = `${(tileWidthPercent * 1.485).toFixed(3)}%`;
            spot.style.transform = 'translate(0%, -35%)';
        } else if (toTop) {
            spot.src = path + '/Rope/RopeUp.png?v=1';
            spot.style.width = `${tileWidthPercent}%`;
            spot.style.transform = 'translate(0%, -55%)';
        } else {
            spot.src = path + '/Rope/Rope.png?v=1';
            spot.style.width = `${tileWidthPercent}%`;
            spot.style.transform = 'translate(0%, -35%)';
        }
    });
}

function getCode(element) {
    if (gamemode === 'Brawl Ball') allQuarters(true, true);
    if (element.checked) {
        let text = '';
        mapCode.forEach(row => {
            text += '"';
            row.forEach(col => {
                text += col.char;
            });
            text += '",\n';
        });
        document.getElementById('codeDisplay').innerText = text;
        document.getElementById('codeDisplay').style.display = 'block';
    }
    else {
        document.getElementById('codeDisplay').style.display = 'none';
    }
    if (gamemode === 'Brawl Ball') allQuarters(true, false);
}

function sameVersion(array1, array2) {
    if (!array1 || !array2) return false;
    if (array1.length !== array2.length) return false;

    for (let i = 0; i < array1.length; i++) {
        if (array1[i].length !== array2[i].length) return false;

        for (let j = 0; j < array1[i].length; j++) {
            const tile1 = array1[i][j];
            const tile2 = array2[i][j];

            // Compare row, col, char, button, upper, and image
            if (tile1.row !== tile2.row || tile1.col !== tile2.col ||
                tile1.char !== tile2.char || tile1.button !== tile2.button ||
                tile1.upper !== tile2.upper || tile1.image !== tile2.image) {
                return false;
            }
        }
    }

    return true;
}