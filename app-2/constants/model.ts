export interface Schedule {
    hour: number,
    minute: number
}
export interface Setting {
    speed: number,
    duration: number,
    schedules: Schedule[],
}