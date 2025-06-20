'use client';

import React from 'react';
import Moment from 'react-moment';

const TimeFormat = ({ time }: { time: string | Date }) => {
  return <Moment format="MMM DD, YYYY">{time}</Moment>;
};

export default TimeFormat;
