#!/bin/bash

PID=$(pgrep -n node)
if [[ $PID != "" ]] ; then kill "$PID" ; fi
