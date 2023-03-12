import React, { useState, useEffect, useRef } from 'react';

import MaterialTable from '@material-table/core';
import axios from 'axios';
import { Typography } from '@mui/material';
import dayjs from 'dayjs';
import { Refresh } from '@mui/icons-material';

const API_URL = 'https://1ndmxvwn7l.execute-api.us-east-1.amazonaws.com/reservation';

const work = new Worker(new URL('/workers/interval.js', 'http://localhost:3000'));

function Host() {
  const [reservations, setReservations] = useState([]);
  const [qdate] = useState(new Date().getTime());
  const [time, setTime] = useState(Date.now());
  const intWorker = useRef(work);

  const fetchReservations = () => {
    axios.get(API_URL, { params: { datetime: qdate } })
      .then((res) => {
        setReservations(res.data.items);
      });
  };

  useEffect(() => {
    if (window.Worker) {
      intWorker.current.postMessage('start');
      intWorker.current.onmessage = (e) => {
        setTime(e.data);
      };
    }
    fetchReservations();
  }, []);

  const columns = [
    { title: 'Date/Time', field: 'timestamp', render: (rowData) => dayjs.unix(rowData.timestamp).format('h:mm A') },
    { title: 'Area', field: 'area' },
    { title: 'Size', field: 'size' },
    { title: 'Customer', field: 'customer.name' },
  ];
  const currentReservations = reservations
    .filter((r) => r.timestamp > (time / 1000))
    .sort((a, b) => a.timestamp - b.timestamp);
  return (
    <>
      <Typography variant="h3">Reservations</Typography>
      <MaterialTable
        data={currentReservations}
        columns={columns}
        actions={[{ icon: Refresh, isFreeAction: true, onClick: fetchReservations }]}
      />
    </>
  );
}

export default Host;
