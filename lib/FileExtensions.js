const { FILE_TYPE } = require('./FileEnums.js');

module.exports.EXECUTABLES = { label: FILE_TYPE.EXECUTABLE, extensions: ['apk', 'bat', 'bin', 'cgi', 'pl', 'exe', 'jar', 'py', 'wsf', 'msi', 'sh'] };

module.exports.OTHER = { label: FILE_TYPE.OTHER, extensions: ['ttf', 'otf', 'fnt', 'fon', 'ppt'] };

module.exports.IMAGES = { label: FILE_TYPE.IMAGE, extensions: ['ai', 'bmp', 'gif', 'ico', 'jpg', 'jpeg', 'png', 'ps', 'psd', 'svg', 'tif'] };

module.exports.TEXT = { label: FILE_TYPE.TEXT, extensions: ['doc', 'docx', 'txt', 'rtf', 'md', 'pdf', 'odt', 'wpd'] };

module.exports.VIDEO = { label: FILE_TYPE.VIDEO, extensions: ['avi', 'flv', 'h264', 'm4v', 'mkv', 'mov', 'mp4', 'mpg', 'mpeg', 'wmv'] };

module.exports.AUDIO = { label: FILE_TYPE.AUDIO, extensions: ['mp3', 'ogg', 'aif', 'cda', 'mid', 'midi', 'mpa', 'wav', 'wma', 'flac'] };

module.exports.ARCHIVE = { label: FILE_TYPE.ARCHIVE, extensions: ['zip', 'gzip', 'rar', '7z', 'tar', 'pkg', 'gz', 'z'] };

module.exports.DATA = { label: FILE_TYPE.DATA, extensions: ['csv', 'dat', 'db', 'dbf', 'log', 'mdb', 'sav', 'sql', 'ini', 'config', 'sql', 'xml'] };

module.exports.SITE_RESOURCE = { label: FILE_TYPE.SITE_RESOURCE, extensions: ['asp', 'aspx', 'cer', 'cgi', 'css', 'js', 'php', 'rss', 'xhtml'] };

module.exports.PROGRAMMING = { label: FILE_TYPE.PROGRAMMING, extensions: ['c', 'cpp', 'java', 'h', 'swift', 'vb'] };

module.exports.SPREADSHEET = { label: FILE_TYPE.SPREADSHEET, extensions: ['osd', 'xlr', 'xls', 'xlsx'] };

module.exports.SYSTEM = { label: FILE_TYPE.SYSTEM, extensions: ['bak', 'cfg', 'cpl', 'cur', 'dll', 'dmp', 'sys', 'tmp', 'lnk'] };

module.exports.LINK = { label: FILE_TYPE.LINK, extensions: ['com', 'edu', 'org', 'net', 'gov', 'uk', 'jp', 'nz', 'ru', 'ca', 'fr', 'sp', 'biz', 'us', 'app', 'blog', 'html', 'htm'] };

//NOTE THAT THIS EXCLUDES LINK
module.exports.ALL_TYPES = [this.EXECUTABLES, this.OTHER, this.IMAGES, this.TEXT, this.VIDEO, this.AUDIO, this.ARCHIVE, this.DATA, this.SITE_RESOURCE, this.PROGRAMMING, this.SPREADSHEET, this.SYSTEM];