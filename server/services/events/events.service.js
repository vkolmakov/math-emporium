import eventStorage from '../eventStorage';


export function getAllEvents() {
    return eventStorage.getAll();
}
