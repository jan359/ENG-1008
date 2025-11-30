
// Lecture material derived explicitly from "ENG1008 Programming Revision questions – Part 1".
// This enforces the specific question styles: Expression Eval, Debugging, Tracing, and Code Writing.

export const LECTURE_MATERIAL = `
REVISION TOPIC 1: ARITHMETIC EXPRESSION EVALUATION
- Requirement: Evaluate mixed-mode arithmetic expressions manually.
- Rules:
  - Precedence: Parentheses () -> Unary (+,-,++,--) -> Multiplicative (*, /, %) -> Additive (+, -).
  - Associativity: Generally Left-to-Right.
  - Integer Division: 24/5 results in 4 (truncation), NOT 4.8.
  - Modulus: 7 % 2 = 1.
- Reference Examples:
  - 5*8/2+(4-2)%3
  - 15-7%2+(5+2)*8
  - 24/5*5+3%8*2  (Note: 24/5 is 4, not 4.8)
  - 2*9%11+3*4

REVISION TOPIC 2: CODE DEBUGGING & ERROR IDENTIFICATION
- Requirement: Identify syntax and logic errors in a provided code snippet.
- Common Errors to Test:
  - Logic Error: Semicolon after while loop header (e.g., 'while (num > 0);') causes infinite loop/empty body.
  - Syntax Error: Incorrect scanf format (missing & for non-pointers).
  - Initialization: Using variables before assigning values.
  - Logic Error: Incorrect loop conditions (off-by-one).
  - Output Error: Mismatching printf format specifiers (%d for floats).
  - Pointer/Array Errors: Dereferencing uninitialized pointers, accessing array index out of bounds.

REVISION TOPIC 3: MANUAL CODE TRACING (OUTPUT PREDICTION)
- Requirement: Determine the exact output without running the code.
- printf Formatting:
  - Precision/Width: %3.1f (min width 3, 1 decimal), %05.2f (zero-pad width 5, 2 decimals).
  - Alignment: %-3d (left align).
  - String formatting: %10s, %.3s.
- Loop Tracing:
  - Complex increments: i++, ++i mixed in expressions (e.g., ++i * j++).
  - Nested loops: Track values of outer/inner variables (e.g., int x=0; while(x++<=20) { ... }).
  - comma operators in for loops: for(a=4, b=8; ...; a++, b--).
- Pointer Tracing:
  - int x=5, *p=&x; *p = 10; (Trace changes to x).
  - int arr[]={10,20,30}, *p=arr; printf("%d", *p++); vs printf("%d", (*p)++);

REVISION TOPIC 4: ALGORITHM & PSEUDOCODE
- Requirement: Write logic for simple problems.
- Examples:
  - Check if number is even/odd (num % 2 == 0).
  - Compute average of 10 inputs.
  - Sum of digits of a number (using % 10 and / 10).
  - Array Logic: Find max value in array, sum elements.

REVISION TOPIC 5: C CODE WRITING
- Requirement: Write specific C constructs to solve problems.
- Control Structures:
  - if-else / nested if-else: Grading system (A>=80, B 70-79, etc.).
  - switch: Map numbers to days (1=Monday).
  - Loops:
    - for: Print multiples of 5.
    - while: Sum integers 1 to n.
    - do-while: Input validation (read until negative entered).
  - Jump Statements:
    - break: Stop loop when specific value entered (e.g., num == 0).
    - continue: Skip processing for specific values (e.g., skip negative numbers).

REVISION TOPIC 6: ARRAYS (Practical)
- Requirement: Trace array indexing and initialization.
- Concepts:
  - Initialization: int a[5] = {1, 2}; (Remaining elements are 0).
  - Bounds: Accessing a[5] in an array of size 5 is Undefined Behavior/Security Risk.
  - Multidimensional: int m[2][3]; m[1][0] is the first element of the second row.
  - Strings: Character arrays terminated by null char '\0'.

REVISION TOPIC 7: POINTERS (Practical)
- Requirement: Trace pointer logic, arithmetic, and function arguments.
- Concepts:
  - Operators: & (address-of), * (dereference).
  - Pass-by-Reference: Using pointers to modify variables in functions (e.g., swap(&a, &b)).
  - Pointer Arithmetic:
    - ptr + 1 moves to the next memory address based on type size (e.g. +4 bytes for int).
    - arr[i] is equivalent to *(arr + i).
  - Difference: *p++ (returns value then increments pointer) vs (*p)++ (increments value pointed to).
`;

export const AVAILABLE_TOPICS = [
  "Arithmetic Expressions",
  "Debugging & Errors",
  "Code Tracing",
  "Algorithms & Pseudocode",
  "C Code Writing",
  "Arrays",
  "Pointers"
];
