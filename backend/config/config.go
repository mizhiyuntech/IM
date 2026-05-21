package config

import (
	"fmt"
	"os"

	"github.com/goccy/go-yaml"
	"github.com/joho/godotenv"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBCharset  string
	ServerPort string
	JWTSecret  string
	Redis      RedisConfig
}

type RedisConfig struct {
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	Password string `yaml:"password"`
	DB       int    `yaml:"db"`
}

func Load() *Config {
	godotenv.Load()

	cfg := &Config{
		DBHost:     getEnv("DB_HOST", "127.0.0.1"),
		DBPort:     getEnv("DB_PORT", "3306"),
		DBUser:     getEnv("DB_USER", "root"),
		DBPassword: getEnv("DB_PASSWORD", ""),
		DBName:     getEnv("DB_NAME", "im_app"),
		DBCharset:  getEnv("DB_CHARSET", "utf8mb4"),
		ServerPort: getEnv("SERVER_PORT", "3132"),
		JWTSecret:  getEnv("JWT_SECRET", "default_secret"),
		Redis: RedisConfig{
			Host:     "127.0.0.1",
			Port:     6379,
			Password: "",
			DB:       0,
		},
	}

	data, err := os.ReadFile("Redis.yml")
	if err == nil {
		var rc RedisConfig
		if err := yaml.Unmarshal(data, &rc); err == nil {
			if rc.Host != "" {
				cfg.Redis.Host = rc.Host
			}
			if rc.Port > 0 {
				cfg.Redis.Port = rc.Port
			}
			if rc.Password != "" {
				cfg.Redis.Password = rc.Password
			}
			if rc.DB >= 0 {
				cfg.Redis.DB = rc.DB
			}
		}
	}

	return cfg
}

func (c *Config) DSN() string {
	return fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=%s&parseTime=True&loc=Local",
		c.DBUser, c.DBPassword, c.DBHost, c.DBPort, c.DBName, c.DBCharset,
	)
}

func (c *Config) RedisAddr() string {
	return fmt.Sprintf("%s:%d", c.Redis.Host, c.Redis.Port)
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
