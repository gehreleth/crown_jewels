package org.diamond.configuration;

import java.util.Properties;

import javax.persistence.EntityManagerFactory;
import javax.sql.DataSource;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.hibernate.cfg.Environment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.convert.threeten.Jsr310JpaConverters;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import org.springframework.util.ClassUtils;
import persistence.PersistenceRootMarker;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(basePackageClasses = PersistenceRootMarker.class)
class PersistenceConfig {
    @Value("${dataSource.poolName}")
    private String poolName;

    @Value("${dataSource.dataSourceClassName}")
    private String dataSourceClassName;

    @Value("${dataSource.maximumPoolSize}")
    private int maximumPoolSize;

    @Value("${dataSource.connectionTestQuery}")
    private String connectionTestQuery;

    @Value("${dataSource.serverName}")
    private String serverName;

    @Value("${dataSource.portNumber}")
    int portNumber;

    @Value("${dataSource.databaseName}")
    String databaseName;

    @Value("${dataSource.username}")
    private String username;

    @Value("${dataSource.password}")
    private String password;

    @Value("${hibernate.dialect}")
    private String dialect;

    @Value("${hibernate.hbm2ddl.auto}")
    private String hbm2ddlAuto;

    @Value("${hibernate.show_sql}")
    private String showSql;

    @Value("${hibernate.format_sql}")
    private String formatSql;

    @Value("${hibernate.use_sql_comments}")
    private String useSqlComments;

    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setPoolName(poolName);
        config.setDataSourceClassName(dataSourceClassName);
        config.setMaximumPoolSize(maximumPoolSize);
        config.setConnectionTestQuery(connectionTestQuery);
        config.addDataSourceProperty("serverName", serverName);
        config.addDataSourceProperty("portNumber", portNumber);
        config.addDataSourceProperty("databaseName", databaseName);
        config.addDataSourceProperty("user", username);
        config.addDataSourceProperty("password", password);
        return new HikariDataSource(config);
    }

    @Bean
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(DataSource dataSource) {
        LocalContainerEntityManagerFactoryBean entityManagerFactoryBean = new LocalContainerEntityManagerFactoryBean();
        entityManagerFactoryBean.setDataSource(dataSource);
        String entities = ClassUtils.getPackageName(PersistenceRootMarker.class);
        String converters = ClassUtils.getPackageName(Jsr310JpaConverters.class);
        entityManagerFactoryBean.setPackagesToScan(entities, converters);
        entityManagerFactoryBean.setJpaVendorAdapter(new HibernateJpaVendorAdapter());
        Properties jpaProperties = new Properties();
        jpaProperties.put(Environment.DIALECT, dialect);
        jpaProperties.put(Environment.HBM2DDL_AUTO, hbm2ddlAuto);
        jpaProperties.put(Environment.SHOW_SQL, showSql);
        jpaProperties.put(Environment.FORMAT_SQL, formatSql);
        jpaProperties.put(Environment.USE_SQL_COMMENTS, useSqlComments);
        entityManagerFactoryBean.setJpaProperties(jpaProperties);
        return entityManagerFactoryBean;
    }

    @Bean
    public PlatformTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}
