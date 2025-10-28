(function () {
  //Lấy thông tin khách hàng về crm
  function getCustomer(formBody) {
    let clientId = localStorage.getItem("rbClientId");
    console.log("rbClientId =>", clientId);

    var t = new XMLHttpRequest();
    var domain = window.location.hostname; // Lấy domain hiện tại

    t.open("POST", "https://cloud.reborn.vn/adminapi/customer/update/webform", true);

    // Thiết lập các headers
    t.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    t.setRequestHeader("Hostname", domain); // Đính kèm domain vào header với key là 'Hostname'

    // Đính kèm clientId vào header nếu có
    if (clientId) {
      t.setRequestHeader("Clientid", clientId);
    }

    // Gửi request với dữ liệu đã bao gồm domain
    t.send(JSON.stringify(formBody));
  }
  // //Lấy thông tin khách hàng về crm - bpm
  // function getCustomerToProcess(formBody) {
  //   let clientId = localStorage.getItem("rbClientId");
  //   console.log("rbClientId =>", clientId);

  //   var t = new XMLHttpRequest();
  //   var domain = window.location.hostname; // Lấy domain hiện tại

  //   // t.open("POST", "https://cloud.reborn.vn/adminapi/customer/update/fromPartner", true);
  //   t.open("POST", "http://192.168.137.1:9100/adminapi/customer/update/fromPartner", true);

  //   // Thiết lập các headers
  //   t.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  //   t.setRequestHeader("Hostname", domain); // Đính kèm domain vào header với key là 'Hostname'

  //   // Đính kèm clientId vào header nếu có
  //   if (clientId) {
  //     t.setRequestHeader("Clientid", clientId);
  //   }

  //   // Gửi request với dữ liệu đã bao gồm domain
  //   t.send(JSON.stringify(formBody));
  // }

  // //Lấy thông tin người liên hệ về CRM
  // function getContact(formBody) {
  //   let clientId = localStorage.getItem("rbClientId");
  //   console.log("rbClientId =>", clientId);

  //   var t = new XMLHttpRequest();
  //   var domain = window.location.hostname; // Lấy domain hiện tại

  //   t.open("POST", "https://cloud.reborn.vn/adminapi/contact/update/webform", true);

  //   // Thiết lập các headers
  //   t.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  //   t.setRequestHeader("Hostname", domain); // Đính kèm domain vào header với key là 'Hostname'

  //   // Đính kèm clientId vào header nếu có
  //   if (clientId) {
  //     t.setRequestHeader("Clientid", clientId);
  //   }

  //   // Gửi request với dữ liệu đã bao gồm domain
  //   t.send(JSON.stringify(formBody));
  // }

  // Lấy thông tin khách hàng về crm - BỔ SUNG: async/await và return Promise kết quả API
  async function getCustomerToProcess(formBody) {
    let clientId = localStorage.getItem("rbClientId");
    console.log("rbClientId =>", clientId);
    const domain = window.location.hostname;

    try {
      // const response = await fetch("https://cloud.reborn.vn/adminapi/customer/update/webform", {
      // const response = await fetch("http://192.168.200.33:9100/adminapi/contact/update/landingPage", {
      const response = await fetch("https://cloud.reborn.vn/adminapi/contact/update/landingPage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Hostname: domain,
          ...(clientId ? { Clientid: clientId } : {}),
        },
        body: JSON.stringify(formBody),
      });

      // Có thể trả về luôn kết quả JSON hoặc text tùy API
      const data = await response.json().catch(() => response.text());
      return data;
    } catch (error) {
      return {
        status: false,
        error: error?.message || error,
      };
    }
  }

  // Lấy thông tin người liên hệ về CRM - BỔ SUNG: async/await và return Promise kết quả API
  async function getContact(formBody) {
    let clientId = localStorage.getItem("rbClientId");
    console.log("rbClientId =>", clientId);
    const domain = window.location.hostname;

    try {
      const response = await fetch("https://cloud.reborn.vn/adminapi/contact/update/webform", {
        // const response = await fetch("http://192.168.23.33:9100/adminapi/contact/update/webform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
          Hostname: domain,
          ...(clientId ? { Clientid: clientId } : {}),
        },
        body: JSON.stringify(formBody),
      });

      // Có thể trả về luôn kết quả JSON hoặc text tùy API
      const data = await response.json().catch(() => response.text());
      return data;
    } catch (error) {
      return {
        status: false,
        error: error?.message || error,
      };
    }
  }

  //Thiết lập clientId từ phía người dùng (key không dùng tới)
  function rb(key, clientId) {
    localStorage.setItem("rbClientId", clientId);
  }

  // Gắn hàm getCustomer vào window để có thể gọi từ bên ngoài
  // Gắn hàm getContact vào window để có thể gọi từ bên ngoài
  window.getCustomer = getCustomer;
  window.getCustomerToProcess = getCustomerToProcess;
  window.getContact = getContact;
  window.rb = rb;
})();
