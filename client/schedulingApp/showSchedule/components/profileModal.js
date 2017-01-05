import React from 'react';

import UpdateProfileForm from '../../profile/components/updateProfileForm';

export default ({ onRequestClose, profile, locations, courses }) => (
    <Modal isOpen={this.state.displayProfileModal}
           onRequestClose={onRequestClose}
           className="profile-form-modal">
        <h2>Before we start scheduling appointments we need some more info about you...</h2>
        <UpdateProfileForm profile={profile}
                           locations={locations}
                           courses={courses}
                           submitCallback={onRequestClose}/>
    </Modal>
);