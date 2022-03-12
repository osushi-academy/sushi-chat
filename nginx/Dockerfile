FROM nginx:1.20.2

COPY template/default.conf.template /etc/nginx/templates/default.conf.template
ENV APP_HOST localhost
ENV APP_PORT 7000

EXPOSE 80

CMD ["nginx", "-g daemon off;"]
