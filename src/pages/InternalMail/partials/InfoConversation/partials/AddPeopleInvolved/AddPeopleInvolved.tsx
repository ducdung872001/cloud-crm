import React, { Fragment, useState, useEffect } from "react";
import Select from "react-select";
import { IAddPeopleInvolvedProps } from "model/mailBox/PropsModel";
import MailboxService from "services/MailboxService";
import EmployeeService from "services/EmployeeService";
import { IOption } from "model/OtherModel";
import { IMailBoxViewerRequestModel } from "model/mailBox/MailBoxRequestModel";
import Icon from "components/icon";
import Button from "components/button/button";
import { showToast } from "utils/common";
import "./AddPeopleInvolved.scss";

export default function AddPeopleInvolved(props: IAddPeopleInvolvedProps) {
  const { onReload, dataProps, id } = props;

  const idDataProps = dataProps.map((item) => item.id);

  const [listEmployee, setListEmployee] = useState<IOption[]>(null);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState<boolean>(false);
  const [updatePerson, setUpdatePerson] = useState<IMailBoxViewerRequestModel>({
    id: id,
    employees: "",
  });

  useEffect(() => {
    setUpdatePerson({ ...updatePerson, id: id });
  }, [id]);

  const onSelectOpenEmployee = async () => {
    if (!listEmployee || listEmployee.length === 0) {
      setIsLoadingEmployee(true);

      const response = await EmployeeService.list();

      if (response.code === 0) {
        const checkDuplicates = [...response.result.items].filter((item) => {
          return !dataProps.some((element) => {
            return element.id === item.id;
          });
        });

        const result = checkDuplicates.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        });

        setListEmployee(result.length > 0 ? result : []);
      }
      setIsLoadingEmployee(false);
    }
  };

  useEffect(() => {
    onSelectOpenEmployee();

    return () => {
      onSelectOpenEmployee();
    };
  }, []);

  const handleChangeValueEmployee = (data) => {
    const value = data.map((item) => item.value);
    setUpdatePerson({ ...updatePerson, employees: JSON.stringify([...idDataProps, ...value]) });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    setIsSubmit(true);

    const body: IMailBoxViewerRequestModel = {
      ...(updatePerson as IMailBoxViewerRequestModel),
    };

    const response = await MailboxService.updateViewer(body);

    if (response.code === 0) {
      showToast("Thêm mới người liên quan thành công", "success");
      onReload(true);
    } else {
      showToast(response.message ?? "Có lỗi xảy ra. Vui lòng thử lại sau", "error");
      setIsSubmit(false);
    }
    setIsSubmit(false);
  };

  return (
    <Fragment>
      <form className="form-add-person" onSubmit={(e) => onSubmit(e)}>
        <div className="list-form-group">
          <div className="form-group">
            <Select
              name="departments"
              className="wrapper__select"
              options={listEmployee}
              isLoading={isLoadingEmployee}
              onMenuOpen={onSelectOpenEmployee}
              placeholder="Chọn nhân viên"
              isMulti
              defaultValue={[]}
              loadingMessage={() => "Đang tải"}
              onChange={(item) => handleChangeValueEmployee(item)}
              noOptionsMessage={() => "Không tìm thấy lựa chọn"}
            />
          </div>
          <Button type="submit" color="success" disabled={isSubmit || updatePerson.employees === ""}>
            {isSubmit ? <Icon name="Loading" /> : <Icon name="PlusCircleFill" />}
          </Button>
        </div>
      </form>
    </Fragment>
  );
}
