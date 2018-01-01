import LocationsReducer from './locations/reducer';
import SubjectsReducer from './subjects/reducer';
import CoursesReducer from './courses/reducer';
import TutorsReducer from './tutors/reducer';
import SchedulesReducer from './schedules/reducer';

const EditingAppReducers = {
    locations: LocationsReducer,
    subjects: SubjectsReducer,
    courses: CoursesReducer,
    tutors: TutorsReducer,
    schedules: SchedulesReducer,
};

export default EditingAppReducers;
