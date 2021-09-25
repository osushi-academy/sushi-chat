#!/bin/bash

PID=$(pgrep -n node)
if [[ $PID != "" ]] ; then kill -9 "$PID" ; fi
