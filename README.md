## Experiment 

This repo demonstrate a local GraphQL layer on top of SQLite, with the capability of managing multiple data stores that are dynamically created, and can be queried/mutated dynamically with GraphQL CRUD operations.

### Architecture

```mermaid
flowchart TB
    app_api[Application API]-->|Static GraphQL|app_db
    store_api[Store API]-->|Dynamic GraphQL|store_db
    
    subgraph "Application Flow"
    mobile_app[Mobile App]-->|blocks,pages,store info|app_api
    ui_comp[UI Table Component]-->|create store|app_api
    ui_comp-->|access store|store_api
    
    end

    
    subgraph "Storage"
    app_db[Local SQLite]
    store_db[...N stores]
    end
```


### Notes

 
