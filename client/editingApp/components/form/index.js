import React from 'react';
import Select from '../select/reactSelectWrapper';
import FormField from './formField';

export default ({ handleSubmit,
                  title,
                  fields }) => (
    <form onSubmit={handleSubmit}>
      <h2>{title}</h2>

      {fields.map(field => (
          <FormField field={field}
                     key={field.label} />
      ))}

      <div className="form-field">
        <button className="button" type="submit">Submit</button>
      </div>
    </form>
);
