import eventStorage from '../eventStorage';


export function getAllEvents() {
    return eventStorage.getAll();
}

export function getLatestEvents(count) {
    return eventStorage.getLatest(count);
}
