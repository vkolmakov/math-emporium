import LocationsReducer from './locations/reducer';
import CoursesReducer from './courses/reducer';
import TutorsReducer from './tutors/reducer';

const EditingAppReducers = {
    locations: LocationsReducer,
    courses: CoursesReducer,
    tutors: TutorsReducer,
};

export default EditingAppReducers;
