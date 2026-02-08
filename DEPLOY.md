# 项目部署指南 (Nginx)

本项目是一个纯静态的 H5 游戏，部署非常简单。只需要将项目文件上传到服务器，并配置 Nginx 指向该目录即可。

## 1. 准备工作

确保你的服务器（如 Ubuntu/CentOS）已安装 Nginx。

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install nginx
```

**CentOS:**
```bash
sudo yum install nginx
```

## 2. 上传文件

将本地 `d:\ma\ma` 目录下的所有文件（排除 `.git`, `.trae` 等开发文件）上传到服务器的 Web 目录，例如 `/var/www/my-pony-game`。

**建议上传的文件/目录：**
- `index.html`
- `style.css`
- `js/` (文件夹)
- `assets/` (如果后续添加了音频/图片资源)

## 3. 配置 Nginx

本项目根目录下已经提供了一个示例配置文件 `nginx.conf`。

1.  **创建配置文件**：
    在 `/etc/nginx/sites-available/` 下创建一个新文件，例如 `pony-game`。

    ```bash
    sudo nano /etc/nginx/sites-available/pony-game
    ```

2.  **复制配置内容**：
    将 `nginx.conf` 中的内容复制进去，并修改 `root` 路径为你实际上传的路径。

    ```nginx
    server {
        listen 80;
        server_name your-domain.com; # 替换为你的域名或 IP

        # 修改为你实际上传的路径
        root /var/www/my-pony-game;
        index index.html;

        # ... (其他配置保持不变，参考项目中的 nginx.conf)
    }
    ```

3.  **启用配置**：
    建立软链接到 `sites-enabled` 目录。

    ```bash
    sudo ln -s /etc/nginx/sites-available/pony-game /etc/nginx/sites-enabled/
    ```

4.  **检查并重启 Nginx**：

    ```bash
    sudo nginx -t   # 检查配置语法是否正确
    sudo systemctl restart nginx
    ```

## 4. 访问

在浏览器中输入你的服务器 IP 或域名，即可开始游戏！

## 5. (可选) Docker 部署

如果你喜欢使用 Docker，可以创建一个 `Dockerfile`：

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
# 如果有自定义 nginx.conf，取消下面这行的注释
# COPY nginx.conf /etc/nginx/conf.d/default.conf
```

然后构建并运行：
```bash
docker build -t pony-game .
docker run -d -p 80:80 pony-game
```
