/**
 * Returns the sum of the numbers in the array.
 */
export function sum(numbers: number[]): number {
    return numbers.reduce((sumSoFar, n) => sumSoFar + n, 0);
}

/**
 * Returns the product of the numbers in the array.
 */
export function product(numbers: number[]): number {
    return numbers.reduce((productSoFar, n) => productSoFar * n, 1);
}

/**
 * Returns the greatest common divisor of a and b.
 */
export function gcd(a: number, b: number): number {
    if (a === 0) {
        return b;
    }
    return gcd(b % a, a);
}

/**
 * Returns the least common multiple of a and b.
 */
export function lcm(a: number, b: number) {
    if (!a || !b) {
        return 0;
    }
    return (a * b) / gcd(a, b);
}

/**
 * Returns the number n, modulo the modulus. The result is always non-negative.
 */
export function mod(n: number, modulus: number) {
    return ((n % modulus) + modulus) % modulus;
}

/**
 * Finds all factors of n.
 */
export function findFactors(n: number) {
    let factors = new Set<number>();

    for (let i = 1; i <= Math.sqrt(n); i++) {
        if (n % i === 0) {
            factors.add(i);
            if (i !== n / i) {
                factors.add(n / i);
            }
        }
    }

    return factors;
}
