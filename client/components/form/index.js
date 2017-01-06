import React from 'react';
import FormField from './formField';
import Alert from './formAlert';
import Success from './formSuccess';

export default ({ handleSubmit,
                  title,
                  fields,
                  error,
                  success }) => (
    <form onSubmit={handleSubmit}>
      <h2>{title}</h2>
      {fields.map(field => (
          <FormField field={field}
                     key={field.label} />
      ))}

      <div className="form-field submit-field">
        <button className="button" type="submit">Submit</button>
        <Alert error={error}/>
        <Success success={success} />

      </div>
    </form>
);
