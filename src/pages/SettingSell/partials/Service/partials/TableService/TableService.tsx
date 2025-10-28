import React, { Fragment } from "react";
import { ITabelServiceProps } from "model/service/PropsModel";
import Loading from "components/loading";
import BoxTable from "components/boxTable/boxTable";
import SearchBox from "components/searchBox/searchBox";
import { SystemNotification } from "components/systemNotification/systemNotification";
import Tippy from "@tippyjs/react";
import Icon from "components/icon";

export default function TableService(props: ITabelServiceProps) {
  const {
    customerFilterList,
    params,
    setParams,
    listSaveSearch,
    titles,
    listService,
    pagination,
    dataMappingArray,
    dataFormat,
    listIdChecked,
    bulkActionList,
    setListIdChecked,
    actionsTable,
    isLoading,
    setDataService,
    isNoItem,
    isPermissions,

    tab,
    targetBsnId,
    setTab,
    listTabs,
    listPartner,
    paginationPartner,
    handlClickPartner,
    paramsServicePartner,
    setParamsServicePartner,
    setIsConfigIntegrateModal
  } = props;

  return (
    <Fragment>
      <div className="action-header">
        <div className="title__actions">
          <ul className="menu-list">
            {listTabs.map((item, idx) => (
                listPartner && listPartner.length > 0 ?
                (
                  <li
                    key={idx}
                    className={item.is_active == tab ? "active" : ""}
                    onClick={(e) => {
                      e && e.preventDefault();
                      setTab(item.is_active);
                    }}
                  >
                    {item.title}
                  </li>
                )
                :
                (
                  (item.is_active === 'tab_one' ?
                    <li
                      key={idx}
                      className={item.is_active == tab ? "active" : ""}
                      onClick={(e) => {
                        e && e.preventDefault();
                        setTab(item.is_active);
                      }}
                    >
                      {item.title}
                    </li>
                    : null
                 )
                )
              ))}
          </ul>
          <Tippy content='Cấu hình tích hợp'>
            <div
              className="setting_action"
              onClick={() => {
                setIsConfigIntegrateModal(true);
              }}
            >
              <Icon name="Settings" style={{ width: 23 }} />
            </div>
          </Tippy>
        </div>

        {tab === 'tab_two' && listPartner && listPartner.length > 0 ? 
          <div className="list-partner">
            <div className="list__relationship">
              {listPartner.map((item, idx) => {
                return item.name ? (
                  <div
                    key={idx}
                    className={`relationship-item ${item.targetBsnId == targetBsnId ? "active__relationship--item" : ""}`}
                    style={{ backgroundColor: item.color, color: item.colorText }}
                    onClick={(e) => {
                      e && e.preventDefault();
                      handlClickPartner(e, item.targetBsnId);
                    }}
                  >
                    {item.name}
                  </div>
                ) : null;
              })}
            </div>
          </div>
        : null}

        <SearchBox
          name="Tên dịch vụ"
          params={tab == 'tab_one' ? params : paramsServicePartner}
          isFilter={true}
          // isSaveSearch={true}
          // listSaveSearch={listSaveSearch}
          listFilterItem={tab === 'tab_one' ? customerFilterList : []}
          updateParams={(paramsNew) => {
            if(tab == 'tab_one'){
              setParams(paramsNew)
            } else {
              setParamsServicePartner(paramsNew)
            }
          }}
        /> 
        
      </div>
      {!isLoading && listService && listService.length > 0 ? (
        <BoxTable
          name="Dịch vụ"
          titles={titles}
          items={listService}
          isPagination={true}
          dataPagination={tab === 'tab_one' ? pagination : paginationPartner}
          dataMappingArray={(item, index) => dataMappingArray(item, index)}
          dataFormat={dataFormat}
          isBulkAction={true}
          listIdChecked={tab === 'tab_one' ? listIdChecked : null}
          bulkActionItems={bulkActionList}
          striped={true}
          setListIdChecked={(listId) => setListIdChecked(listId)}
          actions={actionsTable}
          actionType="inline"
        />
      ) : isLoading ? (
        <Loading />
      ) : (
        <Fragment>
          {isPermissions ? (
            <SystemNotification type="no-permission" />
          ) : isNoItem ? (
            <SystemNotification
              description={
                <span>
                  Hiện tại chưa có dịch vụ nào. <br />
                  {tab == 'tab_one' ? ` Hãy thêm mới dịch vụ đầu tiên nhé!` : ''}
                </span>
              }
              type="no-item"
              titleButton={tab == 'tab_one' ?"Thêm mới dịch vụ" : ""}
              action={() => {
                if(tab == 'tab_one'){
                  setDataService(null);
                }
               
              }}
            />
          ) : (
            <SystemNotification
              description={
                <span>
                  Không có dữ liệu trùng khớp.
                  <br />
                  Bạn hãy thay đổi tiêu chí lọc hoặc tìm kiếm nhé!
                </span>
              }
              type="no-result"
            />
          )}
        </Fragment>
      )}
    </Fragment>
  );
}
