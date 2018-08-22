require('dotenv').config()
const axios = require('axios')
const { DateTime, Interval } = require('luxon')

const {
  CLIENT_ID,
  STREAM_ID,
  TIMES_FILEPATH
} = process.env

const {
  format: compareFormat,
  times: compareTimes
} = require(TIMES_FILEPATH)

axios.defaults.baseURL = 'https://api.twitch.tv/kraken'
axios.defaults.headers.common['Client-ID'] = CLIENT_ID

const localeFormat = {
  weekday: 'short',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
}

;(async () => {
  try {
    const {
      data: {
        videos: vods
      }
    } = await axios(`/channels/${STREAM_ID}/videos?broadcast_type=archive&limit=100`)
    for (const vod of vods) {
      const streamStart = DateTime.fromISO(vod.recorded_at).minus({seconds: vod.length}).toUTC()
      const streamEnd = DateTime.fromISO(vod.recorded_at).toUTC()
      const streamInterval = Interval.fromDateTimes(streamStart, streamEnd)
      for (const compareTime of compareTimes) {
        const compareStart = DateTime.fromFormat(compareTime.start, compareFormat).toUTC()
        const compareEnd = DateTime.fromFormat(compareTime.end, compareFormat).toUTC()
        const compareInterval = Interval.fromDateTimes(compareStart, compareEnd)
        if (streamInterval.overlaps(compareInterval)) {
          console.log(streamInterval.start.toLocal().toLocaleString(localeFormat), '-', streamInterval.end.toLocal().toLocaleString(localeFormat))
        }
      }
    }
  } catch (err) {
    console.log(err)
  }
})()
