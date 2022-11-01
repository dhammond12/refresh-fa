interface MovedComputer {
    tag: number | null;
    serial: string | null;
    location: MovedComputerLocation;
    status: string | null;
    rawDescription: string;
    rawSender: string;
}

export type MovedComputerLocation = {
    building: string;
    room: string;
} | null;

export default MovedComputer;
