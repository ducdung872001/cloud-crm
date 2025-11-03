import React from 'react';
import { MarkerType, Position } from 'reactflow';

export const nodes = [
  {
    id: '1',
    // type: 'input',
    data: {
      label: 'Bộ chỉ số KPI năm 2024',
    },
    position: { x: 338, y: 0 },
    style: {
        width: 250,
        backgroundColor: 'orange',
        border: 0,
        color: 'white'
    }
  },
  {
    id: '2',
    data: {
      label: 'Tài chính',
    },
    position: { x: -238, y: 100 },
    style: {
        borderRadius: "50%",
        width: "12rem",
        padding: "0.8rem",
        backgroundColor: '#10519f',
        color: 'white',
        border: 0,
    }
  },
  {
    id: '3',
    data: {
      label: 'Quy trình',
    },
    position: { x: 300, y: 100 },
    style: {
        borderRadius: "50%",
        width: "12rem",
        padding: "0.8rem",
    }
  },
  {
    id: '4',
    data: {
      label: 'Con người',
    },
    position: { x: 500, y: 100 },
    style: {
        borderRadius: "50%",
        width: "12rem",
        padding: "0.8rem",
    }
  },
  {
    id: '5',
    data: {
      label: 'khách hàng',
    },
    position: { x: 1020, y: 100 },
    style: {
        borderRadius: "50%",
        width: "12rem",
        padding: "0.8rem",
        backgroundColor: '#10519f',
        color: 'white',
        border: 0,
    }
  },
  {
    id: '6',
    data: {
      label: 'Doanh thu trong\n200.000.000',
    },
    position: { x: -730, y: 200 },
    style: {
        // width: 250,
        
        backgroundColor: '#10519f',
        border: 0,
        color: 'white'
    }
  },
  {
    id: '7',
    data: {
      label: 'Doanh thu ngoài\n100.000.000',
    },
    position: { x: -416, y: 200 },
    style: {
        // width: 250,
        backgroundColor: '#10519f',
        border: 0,
        color: 'white'
    }
  },

  {
    id: '8',
    data: {
      label: 'Doanh thu thực hiện\n50.000.000',
    },
    position: { x: -94, y: 200 },
    style: {
        // width: 250,
        
        backgroundColor: '#10519f',
        border: 0,
        color: 'white'
    }
  },
  {
    id: '9',
    data: {
      label: 'Doanh thu ước\n100.000.000',
    },
    position: { x: 226, y: 200 },
    style: {
        // width: 250,
        backgroundColor: '#10519f',
        border: 0,
        color: 'white'
    }
  },

  {
    id: '10',
    data: {
      label: 'Khách hàng trong 2.000',
    },
    position: { x: 568, y: 200 },
    style: {
        width: 120,
        backgroundColor: '#10519f',
        border: 0,
        color: 'white'
    }
  },
  {
    id: '11',
    data: {
      label: 'Khách hàng ngoài\n1.000',
    },
    position: { x: 862, y: 200 },
    style: {
        // width: 250,
        backgroundColor: '#10519f',
        border: 0,
        color: 'white'
    }
  },

  {
    id: '12',
    data: {
      label: 'Khách hàng mới\n1.000',
    },
    position: { x: 1196, y: 200 },
    style: {
        width: 120,
        backgroundColor: '#10519f',
        border: 0,
        color: 'white'
    }
  },
  {
    id: '13',
    data: {
      label: 'Khách hàng bán lại\n500',
    },
    position: { x: 1508, y: 200 },
    style: {
        width: 130,
        backgroundColor: '#10519f',
        border: 0,
        color: 'white'
    }
  },

  {
    id: '14',
    data: {
      label: 'Doanh thu thực hiện\n50.000.000',
    },
    position: { x: -810, y: 300 },
    style: {
        // width: 80,
        backgroundColor: '#10519f',
        border: 0,
        color: 'white'
    }
  },
  {
    id: '15',
    data: {
      label: 'Doanh thu ước\n150.000.000',
    },
    position: { x: -650, y: 300 },
    style: {
        // width: 80,
        backgroundColor: '#10519f',
        border: 0,
        color: 'white'
    }
  },

  {
    id: '16',
    data: {
      label: 'Doanh thu thực hiện\n70.000.000',
    },
    position: { x: -495, y: 300 },
    style: {
        // width: 80,
        backgroundColor: '#10519f',
        border: 0,
        color: 'white'
    }
  },
  {
    id: '17',
    data: {
      label: 'Doanh thu ước\n30.000.000',
    },
    position: { x: -336, y: 300 },
    style: {
        // width: 80,
        backgroundColor: '#10519f',
        border: 0,
        color: 'white'
    }
  },

  {
    id: '18',
    data: {
      label: 'Doanh thu trong\n30.000.000',
    },
    position: { x: -176, y: 300 },
    style: {
        // width: 80,
        backgroundColor: '#10519f',
        border: 0,
        color: 'white'
    }
  },
  {
    id: '19',
    data: {
      label: 'Doanh thu ngoài\n20.000.000',
    },
    position: { x: -13, y: 300 },
    style: {
        // width: 80,
        backgroundColor: '#10519f',
        border: 0,
        color: 'white'
    }
  },


  {
    id: '20',
    data: {
      label: 'Doanh thu trong\n50.000.000',
    },
    position: { x: 148, y: 300 },
    style: {
        // width: 80,
        backgroundColor: '#10519f',
        border: 0,
        color: 'white'
    }
  },
  {
    id: '21',
    data: {
      label: 'Doanh thu ngoài\n50.000.000',
    },
    position: { x: 308, y: 300 },
    style: {
        // width: 80,
        backgroundColor: '#10519f',
        border: 0,
        color: 'white'
    }
  },

  {
    id: '22',
    data: {
      label: 'Khách hàng mới trong: 500',
    },
    position: { x: 468, y: 300 },
    style: {
        width: 120,
        backgroundColor: '#10519f',
        border: 0,
        color: 'white'
    }
  },
  {
    id: '23',
    data: {
      label: 'Khách hàng bán lại trong: 1.500',
    },
    position: { x: 628, y: 300 },
    style: {
        // width: 100,
        backgroundColor: '#10519f',
        border: 0,
        color: 'white'
    }
  },

  {
    id: '24',
    data: {
      label: 'Khách hàng mới ngoài: 500',
    },
    position: { x: 788, y: 300 },
    style: {
        width: 120,
        backgroundColor: '#10519f',
        border: 0,
        color: 'white'
    }
  },
  {
    id: '25',
    data: {
      label: 'Khách hàng bán lại ngoài: 500',
    },
    position: { x: 948, y: 300 },
    style: {
        width: 130,
        backgroundColor: '#10519f',
        border: 0,
        color: 'white'
    }
  },

  // {
  //   id: '26',
  //   data: {
  //     label: 'Khách hàng trong\n500',
  //   },
  //   position: { x: 1106, y: 300 },
  //   style: {
  //       width: 120,
  //       backgroundColor: '#10519f',
  //       border: 0,
  //       color: 'white'
  //   }
  // },
  // {
  //   id: '27',
  //   data: {
  //     label: 'Khách hàng ngoài\n500',
  //   },
  //   position: { x: 1267, y: 300 },
  //   style: {
  //       width: 120,
  //       backgroundColor: '#10519f',
  //       border: 0,
  //       color: 'white'
  //   }
  // },

  // {
  //   id: '28',
  //   data: {
  //     label: 'Khách hàng trong\n300',
  //   },
  //   position: { x: 1430, y: 300 },
  //   style: {
  //       width: 120,
  //       backgroundColor: '#10519f',
  //       border: 0,
  //       color: 'white'
  //   }
  // },
  // {
  //   id: '29',
  //   data: {
  //     label: 'Khách hàng ngoài\n200',
  //   },
  //   position: { x: 1594, y: 300 },
  //   style: {
  //       width: 120,
  //       backgroundColor: '#10519f',
  //       border: 0,
  //       color: 'white'
  //   }
  // },
  

];

export const edges = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e1-4', source: '1', target: '4' },
  { id: 'e1-5', source: '1', target: '5'},

  //tài chính 2
  { id: 'e2-6', source: '2', target: '6' },
  { id: 'e2-7', source: '2', target: '7' },
  { id: 'e2-8', source: '2', target: '8' },
  { id: 'e2-9', source: '2', target: '9'},

  //khách hàng 5
  { id: 'e5-10', source: '5', target: '10' },
  { id: 'e5-11', source: '5', target: '11' },
  { id: 'e5-12', source: '5', target: '12' },
  { id: 'e5-13', source: '5', target: '13'},

  { id: 'e6-14', source: '6', target: '14' },
  { id: 'e6-15', source: '6', target: '15' },

  { id: 'e7-16', source: '7', target: '16' },
  { id: 'e7-17', source: '7', target: '17' },

  { id: 'e8-18', source: '8', target: '18' },
  { id: 'e8-19', source: '8', target: '19' },

  { id: 'e9-20', source: '9', target: '20' },
  { id: 'e9-21', source: '9', target: '21' },

  { id: 'e10-22', source: '10', target: '22' },
  { id: 'e10-23', source: '10', target: '23' },

  { id: 'e11-24', source: '11', target: '24' },
  { id: 'e11-25', source: '11', target: '25' },

  { id: 'e12-26', source: '12', target: '26' },
  { id: 'e12-27', source: '12', target: '27' },

  { id: 'e13-27', source: '13', target: '28' },
  { id: 'e13-28', source: '13', target: '29' },


  
  
];
