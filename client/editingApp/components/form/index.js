import React from 'react';
import FormField from './formField';
import Alert from './formAlert.js';

export default ({ handleSubmit,
                  title,
                  fields,
                  error }) => (
    <form onSubmit={handleSubmit}>
      <h2>{title}</h2>
      {fields.map(field => (
          <FormField field={field}
                     key={field.label} />
      ))}

      <div className="form-field">
        <button className="button" type="submit">Submit</button>
      </div>
      <Alert error={error}/>
      </form>
);
