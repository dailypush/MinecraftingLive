Update the /etc/systemd/system/cleanup-backups.service file to delete backups older than 4 days:
```ini
[Unit]
Description=Cleanup Minecraft backups older than 4 days

[Service]
Type=oneshot
ExecStart=/bin/bash -c 'find /path/to/mc-backups -type f -mtime +3 -name "*.tar.gz" -exec rm {} \;'
```
Make sure to replace /path/to/mc-backups with the actual path to your mc-backups directory.

Update the /etc/systemd/system/cleanup-backups.timer file to run once a day:
```ini
Copy code
[Unit]
Description=Run cleanup-backups once a day

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
```

Reload the systemd configuration:
```bash
sudo systemctl daemon-reload
```

Restart the timer to apply the changes:
```bash
sudo systemctl restart cleanup-backups.timer
```

Check the status of the timer:
```bash
sudo systemctl list-timers
```
You should see the cleanup-backups.timer in the list with the next scheduled run time, now running once a day.

The cleanup service will now run once a day and remove any backup files older than 4 days.