import React, { Component } from 'react';
import CreateCoursesForm from './form.component'; // TODO: make a generic form
import DisplayList from '../displayList.component';

import { connect } from 'react-redux';

import { getCourses, createCourse } from './actions';

const listConfig = {
    title: 'Courses',
    headers: ['Code', 'Name', 'Color', 'Location'],
    dataProps: [
        'code',
        'name',
        'color',
        { key: 'location', display: 'name' },
    ],
    keyProp: 'id',
    apiLink: '/api/private/courses',
    webLink: '/edit-schedule/courses',
};

const formConfig = {
    form: 'CourseForm',
    title: 'Add a New Course',
    fields: [
        {
            name: 'name',
            label: 'Name',
            type: 'text',
            placeholder: 'Course Name',
        }, {
            name: 'code',
            label: 'Code',
            type: 'text',
            placeholder: 'Course Code',
        }, {
            name: 'color',
            label: 'Color',
            type: 'text',
            placeholder: 'Course Color',
        }, {
            name: 'location',
            label: 'Location',
            type: 'select',
            propsOptionsKey: 'locations', // key that contains props options
            optionValueKey: 'id',
            optionDisplayKey: 'name',
            placeholder: 'Select Location',
        },
    ],
};

class EditCourses extends Component {
    componentWillMount() {
        this.props.getCourses();
    }

    render() {
        return (
            <div className="container">
              <CreateCoursesForm
                 config={formConfig}
                 updateData={this.props.getCourses}/>

              <DisplayList
                 data={this.props.courses}
                 config={listConfig}
                 updateData={this.props.getCourses}/>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        courses: state.courses.all,
    };
}

export default connect(mapStateToProps, { getCourses })(EditCourses);
