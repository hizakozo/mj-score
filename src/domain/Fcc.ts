export abstract class FCC<T>  {
    constructor(readonly values: T[]) {
        this.values = values
    }
}