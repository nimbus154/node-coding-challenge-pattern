var split = require("split");
var Transform = require("stream").Transform;
var util = require("util");

// input: a single line of text
// output: 2D array representing a sudoku puzzle
// Output is only written once the puzzle has been created.
// This stream expects the format:
// 1        // number of problems in input
// 2        // size of puzzle
// 1 2 3 4  // puzzle
// 1 2 3 4
// 1 2 3 4
// 1 2 3 4
util.inherits(ProblemStream, Transform);
function ProblemStream () {
    Transform.call(this, { "objectMode": true });

    this.numProblemsToSolve = null;
    this.puzzleSize = null;
    this.currentPuzzle = null;
}

ProblemStream.prototype._transform = function (line, encoding, processed) {
    if (this.numProblemsToSolve === null) { // handle first line
        this.numProblemsToSolve = +line;
    }
    else if (this.puzzleSize === null) { // start a new puzzle
        this.puzzleSize = (+line) * (+line); // a size of 3 means the puzzle will be 9 lines long
        this.currentPuzzle = [];
    }
    else {
        var numbers = line.match(/\d+/g); // break line into an array of numbers
        this.currentPuzzle.push(numbers); // add a new row to the puzzle
        this.puzzleSize--; // decrement number of remaining lines to parse for puzzle

        if (this.puzzleSize === 0) {
            this.push(this.currentPuzzle); // we've parsed the full puzzle; add it to the output stream
            this.puzzleSize = null; // reset; ready for next puzzle
        }
    }
    processed(); // we're done processing the current line
};

// input: 2D array representing sudoku puzzle
// output: boolean representing if puzzle is solved
util.inherits(SolutionStream, Transform);
function SolutionStream () {
    Transform.call(this, { "objectMode": true });
}

SolutionStream.prototype._transform = function (problem, encoding, processed) {
    var solution = solve(problem);
    this.push(solution);
    processed();

    function solve (problem) {
        // TODO
        return false;
    }
};

// input: boolean
// output: formatted string: "Case #n: Yes" or "Case #n: No"
util.inherits(FormatStream, Transform);
function FormatStream () {
    Transform.call(this, { "objectMode": true });

    this.caseNumber = 0;
}

FormatStream.prototype._transform = function (solution, encoding, processed) {
    this.caseNumber++;

    var result = solution ? "Yes" : "No";

    var formatted = "Case #" + this.caseNumber + ": " + result + "\n";

    this.push(formatted);
    processed();
};

process.stdin.setEncoding("utf8"); // expect text written to stdin

process.stdin
    .pipe(split()) // split input into lines
    .pipe(new ProblemStream()) // transform lines into problem data structures
    .pipe(new SolutionStream()) // solve each problem
    .pipe(new FormatStream()) // format the solution for output
    .pipe(process.stdout); // write solution to stdout
