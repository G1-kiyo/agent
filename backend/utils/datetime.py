from datetime import datetime, timezone, timedelta


def totimestamp(dt: datetime | str):
    if isinstance(dt,str):
        dt = datetime.fromisoformat(dt)
    return int(dt.timestamp() * 1000) if dt else None


def sec_to_milsec(timestamp: int):
    return timestamp * 1000 if timestamp else None


def gendatetime():
    return datetime.now(timezone.utc)


def checkisinrange(dt: datetime, delta: timedelta):
    now = datetime.now(timezone.utc)
    return now - delta <= dt <= now
