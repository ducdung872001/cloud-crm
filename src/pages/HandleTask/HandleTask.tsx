import FormViewerComponent from 'pages/BPM/BpmForm/FormViewer';
import React, { useEffect, useRef, useState } from 'react';

const defaultSchema = {
  "type": "default",
  "components": [
    {
      "key": "firstName",
      "label": "First Name",
      "type": "textfield",
      "defaultValue": "",
      "validate": {
        "required": true
      }
    },
    {
      "key": "lastName",
      "label": "Last Name",
      "type": "textfield",
      "defaultValue": "",
      "validate": {
        "required": true
      }
    },
    {
      "key": "age",
      "label": "Age",
      "type": "number",
      "defaultValue": 18,
      "validate": {
        "required": true,
        "min": 18,
        "max": 100
      }
    },
    {
      "key": "gender",
      "label": "Gender",
      "type": "radio",
      "options": [
        { "label": "Male", "value": "male" },
        { "label": "Female", "value": "female" },
        { "label": "Other", "value": "other" }
      ],
      "defaultValue": "male"
    },
    {
      "key": "country",
      "label": "Country",
      "type": "select",
      "options": [
        { "label": "USA", "value": "usa" },
        { "label": "Canada", "value": "canada" },
        { "label": "UK", "value": "uk" }
      ],
      "defaultValue": "usa"
    },
    {
      "key": "acceptTerms",
      "label": "Accept Terms and Conditions",
      "type": "checkbox",
      "defaultValue": false,
      "validate": {
        "required": true
      }
    },
    {
      "key": "submit",
      "label": "Submit",
      "type": "button",
      "action": "submit"
    }
  ]
}


const HandleTask = () => {
  const [formSchema, setFormSchema] = useState(defaultSchema); // Lưu trữ schema

  // Callback để nhận schema khi người dùng thay đổi trong FormEditor
  const handleSchemaChange = (newSchema) => {
    setFormSchema(newSchema); // Cập nhật schema mới
    console.log('Schema mới:', newSchema);
  };


  return (
    <div>
      <h1>Cấu hình biểu mẫu</h1>

      {/* Form Viewer để hiển thị form */}
      <FormViewerComponent formSchema={formSchema} contextData={null} />

    </div>
  );
};

export default HandleTask;