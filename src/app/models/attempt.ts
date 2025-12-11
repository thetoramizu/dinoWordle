export interface Attempt {
date?: string;
guess: string;
result: 'correct' | 'incorrect';
feedback: Array<'green'|'yellow'|'gray'>;
}
