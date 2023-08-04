import React, { useState, useEffect } from 'react';

import MaterialTable from '@material-table/core';
import axios from 'axios';
import {
  Dialog, DialogContent, TextField, Typography, Button, Autocomplete,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import { ContactPage, Edit, Refresh } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { Authenticator } from '@aws-amplify/ui-react';
import { Box } from '@mui/system';
// eslint-disable-next-line import/no-unresolved
import '@aws-amplify/ui-react/styles.css';
import { Header } from '../components';

const API_URL = `${process.env.REACT_APP_API_URL}/reservation`;
const TAGS_URL = `${process.env.REACT_APP_API_URL}/tags`;

function Office() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [tags, setTags] = useState([]);
  const [qdate, setQDate] = useState(new Date().getTime());

  useEffect(() => {
    axios({
      method: 'get',
      url: TAGS_URL,
    }).then((res) => {
      setTags(res.data.items.map((t) => t.name));
    });
  }, []);
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      uuid: '',
      customer: {
        name: '',
        email: '',
        phone: '',
      },
      timestamp: 0,
      area: '',
      size: '',
      occasion: '',
      tags: [],
    },
  });

  const fetchReservations = () => {
    axios.get(API_URL, { params: { datetime: qdate } })
      .then((res) => {
        setReservations(res.data.items);
      });
  };

  useEffect(() => {
    fetchReservations();
  }, [qdate]);

  const updateEvent = () => {
    axios({
      method: 'post',
      url: API_URL,
    }).then(() => {
      reset();
    });
  };

  const areas = {
    floor: 'Dining Floor',
    bar: 'Bar',
    patio: 'Patio',
  };

  const columns = [
    { title: 'Date/Time', field: 'timestamp', render: (rowData) => dayjs(rowData.timestamp).format('M/D h:mm A Z') },
    { title: 'Customer', field: 'customer.name' },
    { title: 'Email', field: 'customer.email' },
    { title: 'Phone', field: 'customer.phone' },
    { title: 'Area', field: 'area', render: ({ area }) => areas[area] },
    { title: 'Size', field: 'size' },
    { title: 'Occasion', field: 'occasion' },
    { title: 'Tags', field: 'tags', render: () => 'tags here' },
  ];

  const currentReservations = reservations
    .sort((a, b) => a.timestamp - b.timestamp);

  return (
    <Authenticator>
      <Header />
      <Dialog open={showAddDialog} onClose={() => { setShowAddDialog(false); }}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box p={5}>
            <form onSubmit={handleSubmit(updateEvent)}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Name"
                  />
                )}
              />
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Tags"
                    options={tags}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    renderInput={(params) => <TextField {...params} />}
                    multiple
                    disablePortal
                  />
                )}
              />
              <Button variant="contained" type="submit">Update Reservation</Button>
            </form>

          </Box>
        </DialogContent>

      </Dialog>
      <Typography variant="h3">Reservations</Typography>
      <DatePicker onChange={(v) => setQDate(v.valueOf())} defaultValue={dayjs()} />
      <MaterialTable
        data={currentReservations}
        columns={columns}
        actions={[{ icon: Refresh, isFreeAction: true, onClick: fetchReservations },
          { icon: ContactPage }, { icon: Edit, onClick: () => { setShowAddDialog(true); } }]}
      />
    </Authenticator>
  );
}

export default Office;
