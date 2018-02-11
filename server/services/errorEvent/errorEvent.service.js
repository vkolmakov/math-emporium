import errorEventStorage from './errorEventStorage';


export function getAllErrorEvents() {
    return errorEventStorage.getAll();
}
