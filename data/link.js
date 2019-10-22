const links = [
  {
    id: 1,
    status: 200,
    title: 'test-one',
    connectionTime: 20,
    metaData: {
      charset:  'utf-8',
      description: "test page",
      keywords: "test, page",
      author: "jim johnson",
      viewport: "width-device-width",
    }
    url: {
      href: "http://test-page.com",
      origin: "http://test-page.com",
      port: 80,
      host: "http://test-page.com",
      favicon: "favicon.ico"
    }
    headers: {
      accessControlAllowOrigin: "*",
      connection: "keep-alive",
      contentEncoding: "gzip",
      contentType: "text/html",
      date: "10/12/2019",
      etag: nil,
      keepAlive: true,
      lastModified: "10/01/2019",
      server: "Apache/2.4.1 (Unix)",
      transferEncoding: "gzip"
    }
    hasChildren: true,
    children {
      length: 1,
      items: [
        {
          id: 3,
          status: 200,
          title: "about me",
          connectionTime: 20,
          metaData: {
            charset:
            description: "about me page",
            keywords: "about, page",
            author: "john johnson",
            viewport:
          },
          url: {
            href: "http://test-page.com/about",
            origin: "http://test-page.com",
            port: 80,
            host: "http://test-page.com",
            favicon: "favicon.ico"
          },
          headers: {
            accessControlAllowOrigin: "*",
            connection: "keep-alive",
            contentEncoding: "gzip",
            contentType: "text/html",
            date: "10/12/2019",
            etag: nil,
            keepAlive: true,
            lastModified: "10/01/2019",
            server: "Apache/2.4.1 (Unix)",
            transferEncoding: "gzip"
          },
          hasChildren: false,
          children {
            length: 0 ,
            items: [ ]
          }
        },
      ]
    }
  },
  {
    id: 2,
    status: 200,
    title: "contact me",
    connectionTime: 20,
    metaData: {
      charset:  'utf-8',
      description: "contact page",
      keywords: "contact, page",
      author: "jim johnson",
      viewport: "width-device-width",
    }
    url: {
      href: "http://test-page.com/contact",
      origin: "http://test-page.com",
      port: 80,
      host: "http://test-page.com",
      favicon: "favicon.ico"
    },
    headers: {
      accessControlAllowOrigin: "*",
      connection: "keep-alive",
      contentEncoding: "gzip",
      contentType: "text/html",
      date: "10/12/2019",
      etag: nil,
      keepAlive: true,
      lastModified: "10/01/2019",
      server: "Apache/2.4.1 (Unix)",
      transferEncoding: "gzip"
    },
    hasChildren: false,
    children {
      length: 0,
      items: [ ]
    }
  }
];

module.exports = links;
